/**
 * Error hierarchy for the Scout SDK.
 *
 * Every failure surfaces as a `ScoutError`. Network/timeouts become
 * `ConnectionError` / `TimeoutError`; any HTTP response with a non-2xx
 * status becomes an `APIError` subclass chosen by status code. The raw
 * status, parsed body, and request id are always available so callers can
 * branch on `instanceof RateLimitError` or read `err.status` directly.
 */

export interface ScoutErrorOptions {
  status?: number;
  requestId?: string;
  body?: unknown;
  code?: string;
  headers?: Record<string, string>;
  cause?: unknown;
}

export class ScoutError extends Error {
  /** HTTP status code, when the failure came from a response. */
  readonly status?: number;
  /** Server-assigned request id (from the `x-request-id` header), for support. */
  readonly requestId?: string;
  /** Parsed JSON error body, when the response had one. */
  readonly body?: unknown;
  /** Machine-readable error code from the body, when present. */
  readonly code?: string;
  /** Response headers, when the failure came from a response. */
  readonly headers?: Record<string, string>;

  constructor(message: string, options: ScoutErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = this.constructor.name;
    this.status = options.status;
    this.requestId = options.requestId;
    this.body = options.body;
    this.code = options.code;
    this.headers = options.headers;
    // Restore the prototype chain for `instanceof` across the transpile target.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** No HTTP response was received (DNS, refused connection, socket hang up). */
export class ConnectionError extends ScoutError {}

/** The request exceeded the configured timeout before a response arrived. */
export class TimeoutError extends ConnectionError {}

/** The request was aborted by the caller (via an AbortSignal). */
export class AbortError extends ScoutError {}

/** Base for every error carrying an HTTP status from the API. */
export class APIError extends ScoutError {}

/** 400 — malformed request (bad params, invalid JSON). */
export class BadRequestError extends APIError {}

/** 401 — missing or invalid API key. */
export class AuthenticationError extends APIError {}

/** 402 — the team is out of credits for this operation. */
export class InsufficientCreditsError extends APIError {}

/** 403 — authenticated, but not allowed to perform this action. */
export class PermissionDeniedError extends APIError {}

/** 404 — the resource (search id, job id, monitor id) does not exist. */
export class NotFoundError extends APIError {}

/** 409 — the request conflicts with the current state of the resource. */
export class ConflictError extends APIError {}

/** 422 — the request was well-formed but failed validation. */
export class UnprocessableEntityError extends APIError {}

/** 429 — rate limit exceeded. Inspect `headers['retry-after']` to back off. */
export class RateLimitError extends APIError {}

/** >=500 — the Scout API failed to handle a valid request. */
export class InternalServerError extends APIError {}

/**
 * Construct the most specific `APIError` for an HTTP status. Falls back to
 * `BadRequestError` for other 4xx and `InternalServerError` for other 5xx.
 */
export function apiErrorFromStatus(
  status: number,
  message: string,
  options: ScoutErrorOptions,
): APIError {
  const opts = { ...options, status };
  switch (status) {
    case 400:
      return new BadRequestError(message, opts);
    case 401:
      return new AuthenticationError(message, opts);
    case 402:
      return new InsufficientCreditsError(message, opts);
    case 403:
      return new PermissionDeniedError(message, opts);
    case 404:
      return new NotFoundError(message, opts);
    case 409:
      return new ConflictError(message, opts);
    case 422:
      return new UnprocessableEntityError(message, opts);
    case 429:
      return new RateLimitError(message, opts);
  }
  if (status >= 500) return new InternalServerError(message, opts);
  return new BadRequestError(message, opts);
}
