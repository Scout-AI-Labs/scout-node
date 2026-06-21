import { APIResource } from './_base';
import type { RequestOptions } from '../client';
import type { ScoutResponse, ProductsParams, ProductOneParams } from '../types';

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
