import { APIResource } from './_base';
import type { RequestOptions } from '../client';
import type {
  ScoutResponse,
  PageMarkdownParams,
  PageHTMLParams,
  PageScreenshotParams,
  PageImagesParams,
  PageExtractParams,
} from '../types';

/** Single-page operations: markdown, html, screenshot, images, extract. */
export class Page extends APIResource {
  /** Fetch a page rendered to clean Markdown. */
  markdown(params: PageMarkdownParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/page/markdown',
      body: params,
      options,
    });
  }

  /** Fetch a page's HTML. */
  html(params: PageHTMLParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/page/html',
      body: params,
      options,
    });
  }

  /**
   * Capture a screenshot of a page.
   *
   * Returns a JSON envelope by default; set `inline: true` for a data URI, or
   * read the returned URL. Tune `viewport_width/height`, `full_page`, `format`.
   */
  screenshot(params: PageScreenshotParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/page/screenshot',
      body: params,
      options,
    });
  }

  /** Extract the images on a page, with optional inline data URIs. */
  images(params: PageImagesParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/page/images',
      body: params,
      options,
    });
  }

  /** Structured extraction scoped to a single page. */
  extract(params: PageExtractParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/page/extract',
      body: params,
      options,
    });
  }
}
