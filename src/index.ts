/**
 * Scout — official Node/TypeScript SDK.
 *
 * ```ts
 * import Scout from '@scout-ai/sdk';
 *
 * const scout = new Scout({ apiKey: process.env.SCOUT_API_KEY });
 * const res = await scout.search.create({ queries: ['climate tech startups'] });
 * ```
 */

export { Scout } from './client.js';
export { Scout as default } from './client.js';
export type { ClientOptions, RequestOptions } from './client.js';

export {
  ScoutError,
  APIError,
  ConnectionError,
  TimeoutError,
  AbortError,
  BadRequestError,
  AuthenticationError,
  InsufficientCreditsError,
  PermissionDeniedError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
} from './errors.js';

export { VERSION, API_VERSION } from './version.js';
export type { SSEvent } from './sse.js';

export * from './types.js';
