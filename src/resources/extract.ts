import { APIResource } from './_base';
import type { RequestOptions } from '../client';
import type { ScoutResponse, ExtractParams } from '../types';

/** Multi-URL structured extraction. */
export class Extract extends APIResource {
  /**
   * Extract structured data from one or more URLs. Provide an `objective` or
   * an `output_schema` (JSON Schema) to shape the result; set
   * `find_via_search: true` with `search_queries` to discover URLs first.
   *
   * ```ts
   * const res = await scout.extract.create({
   *   urls: ['https://example.com/pricing'],
   *   output_schema: { type: 'object', properties: { plans: { type: 'array' } } },
   * });
   * ```
   */
  create(params: ExtractParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/extract',
      body: params,
      options,
    });
  }
}
