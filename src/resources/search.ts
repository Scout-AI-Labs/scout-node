import { APIResource } from './_base';
import { autoPaginate } from '../pagination';
import type { RequestOptions } from '../client';
import type {
  ScoutResponse,
  SearchParams,
  SearchListParams,
  AIQueryParams,
} from '../types';

/** Web search, agentic AI queries, and search-run history. */
export class Search extends APIResource {
  /**
   * Run a web search. Pass one or more `queries`; tune depth, freshness,
   * country, and domain filters via the other params.
   *
   * ```ts
   * const res = await scout.search.create({ queries: ['climate tech startups'] });
   * ```
   */
  create(params: SearchParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/search',
      body: params,
      options,
    });
  }

  /** Ask a natural-language question answered by reading a page (and links). */
  aiQuery(params: AIQueryParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/ai-query',
      body: params,
      options,
    });
  }

  /** List prior search runs (most recent first). */
  list(params: SearchListParams = {}, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: '/v1/searches',
      query: params,
      options,
    });
  }

  /** Auto-paginating iterator over all search runs. */
  iterate(params: SearchListParams = {}, options?: RequestOptions) {
    return autoPaginate<ScoutResponse>(
      (limit, offset) => this.list({ ...params, limit, offset }, options),
      params,
    );
  }

  /** Fetch a single search run by id. */
  get(searchId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/searches/${encodeURIComponent(searchId)}`,
      options,
    });
  }

  /** Cancel an in-flight search run. */
  cancel(searchId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: `/v1/searches/${encodeURIComponent(searchId)}/cancel`,
      options,
    });
  }

  /** Fetch the event stream (as JSON) for a search run. */
  events(searchId: string, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'GET',
      path: `/v1/searches/${encodeURIComponent(searchId)}/events`,
      options,
    });
  }
}
