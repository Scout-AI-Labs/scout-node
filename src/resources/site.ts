import { APIResource } from './_base.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, SiteCrawlParams, SiteMapParams } from '../types.js';

/** Whole-site operations: crawl and sitemap discovery. */
export class Site extends APIResource {
  /**
   * Crawl a site from `start_url`. Bound it with `max_pages`/`max_depth` and
   * scope it with `same_host_only`, `include_patterns`, `exclude_patterns`.
   */
  crawl(params: SiteCrawlParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/site/crawl',
      body: params,
      options,
    });
  }

  /** Discover a site's URLs (sitemap) from `start_url`. */
  map(params: SiteMapParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/site/map',
      body: params,
      options,
    });
  }
}
