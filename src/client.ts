/**
 * Core HTTP client for the Scout API.
 *
 * Zero runtime dependencies: built entirely on the global `fetch`,
 * `AbortController`, and `crypto` available in Node 18+, Deno, Bun, and
 * edge/Workers runtimes. Resource groups (search, page, extract, ...) hang
 * off the `Scout` client and call the shared `request()` method, which
 * handles auth headers, JSON encoding, timeouts, retries with exponential
 * backoff + jitter, idempotency keys, and error mapping.
 */

import {
  ScoutError,
  ConnectionError,
  TimeoutError,
  AbortError,
  apiErrorFromStatus,
} from './errors';
import { VERSION, API_VERSION } from './version';
import { Search } from './resources/search';
import { Page } from './resources/page';
import { Extract } from './resources/extract';
import { Company } from './resources/company';
import { Lists } from './resources/lists';
import { Products } from './resources/products';
import { Site } from './resources/site';
import { Jobs } from './resources/jobs';
import { Monitors } from './resources/monitors';
import { Chat } from './resources/chat';

const DEFAULT_BASE_URL = 'https://core.usescout.sh';
const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_MAX_RETRIES = 2;

export interface ClientOptions {
  /** API key. Defaults to `process.env.SCOUT_API_KEY`. */
  apiKey?: string;
  /** API origin. Defaults to `https://core.usescout.sh`. */
  baseURL?: string;
  /** Per-request timeout in milliseconds. Defaults to 60000. */
  timeout?: number;
  /** Max automatic retries for transient failures. Defaults to 2. */
  maxRetries?: number;
  /** Extra headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /** Override the global `fetch` (for testing or custom runtimes). */
  fetch?: typeof fetch;
}

/** Per-call overrides accepted as the last argument of every method. */
export interface RequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  /** Caller-supplied abort signal; composes with the timeout. */
  signal?: AbortSignal;
  /** Idempotency key. Auto-generated for write methods if omitted. */
  idempotencyKey?: string;
}

interface InternalRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  options?: RequestOptions;
}

const RETRY_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class Scout {
  readonly baseURL: string;
  readonly maxRetries: number;
  readonly timeout: number;

  private readonly apiKey: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  // Resource groups — a faithful 1:1 mirror of the REST API tags.
  readonly search: Search;
  readonly page: Page;
  readonly extract: Extract;
  readonly company: Company;
  readonly lists: Lists;
  readonly products: Products;
  readonly site: Site;
  readonly jobs: Jobs;
  readonly monitors: Monitors;
  readonly chat: Chat;

  constructor(options: ClientOptions = {}) {
    const apiKey =
      options.apiKey ??
      (typeof process !== 'undefined' ? process.env?.SCOUT_API_KEY : undefined);
    if (!apiKey) {
      throw new ScoutError(
        'Missing API key. Pass { apiKey } or set the SCOUT_API_KEY environment variable.',
      );
    }
    this.apiKey = apiKey;
    this.baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.defaultHeaders = options.defaultHeaders ?? {};

    const f = options.fetch ?? globalThis.fetch;
    if (!f) {
      throw new ScoutError(
        'No global fetch found. Use Node 18+, or pass a fetch implementation via { fetch }.',
      );
    }
    this.fetchImpl = f;

    this.search = new Search(this);
    this.page = new Page(this);
    this.extract = new Extract(this);
    this.company = new Company(this);
    this.lists = new Lists(this);
    this.products = new Products(this);
    this.site = new Site(this);
    this.jobs = new Jobs(this);
    this.monitors = new Monitors(this);
    this.chat = new Chat(this);
  }

  /** Internal: issue a request with retries and typed error mapping. */
  async request<T>(req: InternalRequest): Promise<T> {
    const opts = req.options ?? {};
    const maxRetries = opts.maxRetries ?? this.maxRetries;
    const isWrite = req.method !== 'GET';

    const url = this.buildURL(req.path, req.query);
    const headers = this.buildHeaders(req, opts, isWrite);
    const bodyText =
      req.body !== undefined && req.method !== 'GET'
        ? JSON.stringify(req.body)
        : undefined;

    let attempt = 0;
    // attempt 0 is the initial try; up to `maxRetries` further attempts.
    for (;;) {
      try {
        return await this.attempt<T>(req.method, url, headers, bodyText, opts);
      } catch (err) {
        const retriable = this.isRetriable(err);
        if (!retriable || attempt >= maxRetries) throw err;
        const wait = this.backoffMs(attempt, err);
        await sleep(wait, opts.signal);
        attempt += 1;
      }
    }
  }

  private async attempt<T>(
    method: string,
    url: string,
    headers: Record<string, string>,
    bodyText: string | undefined,
    opts: RequestOptions,
  ): Promise<T> {
    const timeout = opts.timeout ?? this.timeout;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new TimeoutError(
      `Request timed out after ${timeout}ms`,
    )), timeout);
    const onAbort = () => controller.abort(opts.signal?.reason);
    if (opts.signal) {
      if (opts.signal.aborted) onAbort();
      else opts.signal.addEventListener('abort', onAbort, { once: true });
    }

    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method,
        headers,
        body: bodyText,
        signal: controller.signal,
      });
    } catch (err) {
      if (controller.signal.reason instanceof TimeoutError) {
        throw controller.signal.reason;
      }
      if (opts.signal?.aborted) {
        throw new AbortError('Request aborted', { cause: opts.signal.reason });
      }
      throw new ConnectionError(
        err instanceof Error ? err.message : 'Network request failed',
        { cause: err },
      );
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
    }

    return this.parseResponse<T>(res);
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const requestId = res.headers.get('x-request-id') ?? undefined;
    const headers = headersToObject(res.headers);

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const isJSON = (res.headers.get('content-type') ?? '').includes('json');
    const parsed = isJSON && text ? safeJSON(text) : text;

    if (res.ok) return parsed as T;

    const message = errorMessage(parsed, res.status);
    const code = extractCode(parsed);
    throw apiErrorFromStatus(res.status, message, {
      requestId,
      headers,
      body: parsed,
      code,
    });
  }

  private buildURL(path: string, query?: Record<string, unknown>): string {
    const url = new URL(this.baseURL + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) {
          for (const item of v) url.searchParams.append(k, String(item));
        } else {
          url.searchParams.set(k, String(v));
        }
      }
    }
    return url.toString();
  }

  private buildHeaders(
    req: InternalRequest,
    opts: RequestOptions,
    isWrite: boolean,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.apiKey}`,
      accept: 'application/json',
      'user-agent': `scout-node/${VERSION}`,
      'scout-version': API_VERSION,
      ...this.defaultHeaders,
      ...opts.headers,
    };
    if (req.body !== undefined && req.method !== 'GET') {
      headers['content-type'] = 'application/json';
    }
    if (isWrite) {
      headers['idempotency-key'] = opts.idempotencyKey ?? randomId();
    }
    return headers;
  }

  private isRetriable(err: unknown): boolean {
    if (err instanceof AbortError) return false;
    if (err instanceof TimeoutError) return true;
    if (err instanceof ConnectionError) return true;
    if (err instanceof ScoutError && typeof err.status === 'number') {
      return RETRY_STATUSES.has(err.status);
    }
    return false;
  }

  private backoffMs(attempt: number, err: unknown): number {
    // Honor an explicit Retry-After header when the server sends one.
    if (err instanceof ScoutError) {
      const retryAfter = err.headers?.['retry-after'];
      if (retryAfter) {
        const secs = Number(retryAfter);
        if (Number.isFinite(secs)) return Math.min(secs * 1000, 60_000);
      }
    }
    // Exponential backoff (0.5s, 1s, 2s, ...) capped at 8s, with full jitter.
    const base = Math.min(500 * 2 ** attempt, 8_000);
    return base * (0.5 + Math.random() * 0.5);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortError('Request aborted', { cause: signal.reason }));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AbortError('Request aborted', { cause: signal?.reason }));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function headersToObject(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function safeJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    const detail = b.detail ?? b.error ?? b.message;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object') {
      const d = detail as Record<string, unknown>;
      if (typeof d.message === 'string') return d.message;
    }
  }
  if (typeof body === 'string' && body) return body;
  return `Scout API returned HTTP ${status}`;
}

function extractCode(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b.code === 'string') return b.code;
    const err = b.error;
    if (err && typeof err === 'object') {
      const code = (err as Record<string, unknown>).code;
      if (typeof code === 'string') return code;
    }
  }
  return undefined;
}

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for older runtimes without crypto.randomUUID.
  return 'idmp-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
