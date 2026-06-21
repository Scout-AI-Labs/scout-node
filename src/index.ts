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

export { Scout } from './client';
export { Scout as default } from './client';
export type { ClientOptions, RequestOptions } from './client';

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
} from './errors';

export { VERSION, API_VERSION } from './version';

export * from './types';
