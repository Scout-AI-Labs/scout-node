import { APIResource } from './_base.js';
import type { RequestOptions } from '../client.js';
import type {
  ScoutResponse,
  CompanyDomainParams,
  CompanyByEmailParams,
  CompanyByNameParams,
  CompanyByTickerParams,
  LogoParams,
} from '../types.js';

/** Company enrichment: profiles, logos, fonts, industry codes, styleguide. */
export class Company extends APIResource {
  /** Full company profile from a domain. */
  enrich(params: CompanyDomainParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company',
      body: params,
      options,
    });
  }

  /** Resolve a company from a work email address. */
  byEmail(params: CompanyByEmailParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/by-email',
      body: params,
      options,
    });
  }

  /** Resolve a company from its name. */
  byName(params: CompanyByNameParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/by-name',
      body: params,
      options,
    });
  }

  /** Resolve a company from a stock ticker. */
  byTicker(params: CompanyByTickerParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/by-ticker',
      body: params,
      options,
    });
  }

  /** A condensed company profile (faster, fewer fields). */
  simple(params: CompanyDomainParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/simple',
      body: params,
      options,
    });
  }

  /** Brand fonts detected on the company's site. */
  fonts(params: CompanyDomainParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/fonts',
      body: params,
      options,
    });
  }

  /** Brand styleguide (colors, typography, logos) for a company. */
  styleguide(params: CompanyDomainParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/styleguide',
      body: params,
      options,
    });
  }

  /**
   * Company logo metadata (the served asset lives on the logo CDN). Choose
   * `mode` (light/dark), `format` (svg/png/webp/jpg), and `variant`.
   */
  logo(params: LogoParams, options?: RequestOptions): Promise<ScoutResponse> {
    return this.client.request({
      method: 'POST',
      path: '/v1/company/logo',
      body: params,
      options,
    });
  }
}
