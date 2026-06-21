import { APIResource } from './_base.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, ProductsParams, ProductOneParams } from '../types.js';

/** Product extraction from storefronts. */
export class Products extends APIResource {
  /**
   * Crawl a store and extract its products. Bound the crawl with `max_pages`
   * and `max_depth`; steer it with `instructions`.
   */
  extract(params: ProductsParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/products',
      body: params,
      options,
    });
  }

  /** Extract a single product from one product-detail URL. */
  one(params: ProductOneParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/products/one',
      body: params,
      options,
    });
  }
}
