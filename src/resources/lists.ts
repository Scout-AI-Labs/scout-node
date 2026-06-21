import { APIResource } from './_base.js';
import { autoPaginate } from '../pagination.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, ListsParams, SearchListParams } from '../types.js';

/**
 * Find-all ("lists"): build a list of entities matching a natural-language
 * query, then enrich or extend the run.
 */
export class Lists extends APIResource {
  /**
   * Run a find-all synchronously. Pass a `query` and optional `fields` or an
   * `output_schema` to shape each entity.
   */
  create(params: ListsParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/lists',
      body: params,
      options,
    });
  }

  /** Start an async find-all run; poll `runs.get(id)` for progress. */
  run(params: ListsParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/lists/runs',
      body: params,
      options,
    });
  }

  /** Operations on async find-all runs. */
  readonly runs = {
    list: (params: SearchListParams = {}, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'GET',
        path: '/v1/lists/runs',
        query: params,
        options,
      }),

    iterate: (params: SearchListParams = {}, options?: RequestOptions) =>
      autoPaginate<ScoutResponse>(
        (limit, offset) =>
          this.runs.list({ ...params, limit, offset }, options),
        params,
      ),

    get: (findallId: string, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'GET',
        path: `/v1/lists/runs/${encodeURIComponent(findallId)}`,
        options,
      }),

    cancel: (findallId: string, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'POST',
        path: `/v1/lists/runs/${encodeURIComponent(findallId)}/cancel`,
        options,
      }),

    /** Enrich the run's entities with additional fields. */
    enrich: (
      findallId: string,
      body: Record<string, unknown> = {},
      options?: RequestOptions,
    ): Promise<ScoutResponse> =>
      this.client.request({
        method: 'POST',
        path: `/v1/lists/runs/${encodeURIComponent(findallId)}/enrich`,
        body,
        options,
      }),

    /** Extend the run with more matching entities. */
    extend: (
      findallId: string,
      body: Record<string, unknown> = {},
      options?: RequestOptions,
    ): Promise<ScoutResponse> =>
      this.client.request({
        method: 'POST',
        path: `/v1/lists/runs/${encodeURIComponent(findallId)}/extend`,
        body,
        options,
      }),

    events: (findallId: string, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'GET',
        path: `/v1/lists/runs/${encodeURIComponent(findallId)}/events`,
        options,
      }),
  };
}
