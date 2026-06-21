/**
 * Request and response types for the Scout API.
 *
 * Param types cover the documented fields and end with an index signature
 * (`[key: string]: unknown`) so newly-shipped API parameters work without an
 * SDK upgrade. Response payloads are intentionally permissive (`ScoutResponse`)
 * because Scout returns rich, evolving nested objects; cast to your own shape
 * or read fields directly.
 */

/** A JSON object response. Fields vary by endpoint; index to read them. */
export type ScoutResponse = Record<string, unknown>;

/** Forward-compatible escape hatch on every params type. */
export interface Extensible {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchParams extends Extensible {
  /** One or more search queries. */
  queries: string[];
  objective?: string | null;
  /** "shallow" | "standard" | "deep". */
  depth?: string;
  mode?: string | null;
  category?: string | null;
  limit?: number;
  country?: string;
  location?: string | null;
  language?: string;
  freshness?: string | null;
  include_domains?: string[] | null;
  exclude_domains?: string[] | null;
  session_id?: string | null;
  webhook?: string | null;
}

export interface SearchListParams extends Extensible {
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// AI query
// ---------------------------------------------------------------------------

export interface AIQueryParams extends Extensible {
  url: string;
  question: string;
  max_pages?: number;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export interface PageMarkdownParams extends Extensible {
  url: string;
  max_chars?: number;
}

export interface PageHTMLParams extends Extensible {
  url: string;
}

export interface PageScreenshotParams extends Extensible {
  url: string;
  viewport_width?: number;
  viewport_height?: number;
  full_page?: boolean;
  /** "png" | "jpeg" | "webp". */
  format?: string;
  wait_ms?: number;
  inline?: boolean;
  element_selector?: string | null;
  dismiss_overlays?: boolean;
}

export interface PageImagesParams extends Extensible {
  url: string;
  max_images?: number;
  include_data_uris?: boolean;
  mode?: string;
}

export interface PageExtractParams extends Extensible {
  url: string;
}

// ---------------------------------------------------------------------------
// Extract
// ---------------------------------------------------------------------------

export interface ExtractParams extends Extensible {
  urls: string[];
  objective?: string | null;
  search_queries?: string[] | null;
  find_via_search?: boolean | null;
  max_chars_total?: number | null;
  max_chars?: number | null;
  /** A JSON Schema object describing the desired output shape. */
  output_schema?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

export interface CompanyDomainParams extends Extensible {
  domain: string;
}

export interface CompanyByEmailParams extends Extensible {
  email: string;
}

export interface CompanyByNameParams extends Extensible {
  name: string;
}

export interface CompanyByTickerParams extends Extensible {
  ticker: string;
}

export interface LogoParams extends Extensible {
  domain: string;
  /** "light" | "dark". */
  mode?: string;
  /** "svg" | "png" | "webp" | "jpg". */
  format?: string;
  /** "icon" | "wordmark" | "combination" | "logo". */
  variant?: string;
}

// ---------------------------------------------------------------------------
// Lists (find-all)
// ---------------------------------------------------------------------------

export interface ListsParams extends Extensible {
  query: string;
  fields?: string[] | null;
  output_schema?: Record<string, unknown> | null;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductsParams extends Extensible {
  url: string;
  max_pages?: number;
  max_depth?: number;
  instructions?: string | null;
  followSubdomains?: boolean;
}

export interface ProductOneParams extends Extensible {
  url: string;
}

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------

export interface SiteCrawlParams extends Extensible {
  start_url: string;
  max_pages?: number;
  max_depth?: number;
  same_host_only?: boolean;
  include_patterns?: string[] | null;
  exclude_patterns?: string[] | null;
  followSubdomains?: boolean;
}

export interface SiteMapParams extends Extensible {
  start_url: string;
  max_pages?: number;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export interface JobCreateParams extends Extensible {
  task: string;
  output_schema?: Record<string, unknown> | null;
  processor?: string;
  metadata?: Record<string, unknown> | null;
  webhook?: string | null;
}

// ---------------------------------------------------------------------------
// Monitors
// ---------------------------------------------------------------------------

export interface MonitorCreateParams extends Extensible {
  query: string;
  webhook?: string | null;
  cadence?: string | null;
  cron?: string | null;
  mode?: string;
  filter_prompt?: string | null;
  country?: string;
  language?: string;
  metadata?: Record<string, unknown> | null;
}

export interface MonitorUpdateParams extends Extensible {
  query?: string;
  webhook?: string | null;
  cadence?: string | null;
  cron?: string | null;
  filter_prompt?: string | null;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage extends Extensible {
  role: string;
  content: string;
}

export interface ChatParams extends Extensible {
  messages: ChatMessage[];
  model?: string | null;
  stream?: boolean;
  temperature?: number | null;
  top_p?: number | null;
  web_search?: boolean;
  max_tokens?: number;
}
