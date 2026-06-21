# Scout Node SDK

Official Node/TypeScript SDK for the [Scout](https://usescout.sh) web-intelligence API: search, scrape, screenshot, extract, crawl, and company enrichment.

- Built on the global `fetch`, so it runs on Node 18+, Deno, Bun, and edge runtimes.
- Typed end to end: every endpoint, parameter, and error.
- Automatic retries with backoff and jitter, configurable timeouts, and idempotency keys on writes.

## Requirements

- Node.js 18+ (or any runtime with a global `fetch`: Deno, Bun, Cloudflare Workers, edge).

## Installation

```sh
yarn add @scout-ai/sdk
# or: npm install @scout-ai/sdk
```

## Authentication

Generate an API key at [platform.usescout.sh/settings](https://platform.usescout.sh/settings). The client reads `SCOUT_API_KEY` from the environment by default:

```ts
import Scout from '@scout-ai/sdk';

const scout = new Scout(); // uses process.env.SCOUT_API_KEY
// or pass it explicitly:
const scout = new Scout({ apiKey: 'sk_...' });
```

## Quickstart

```ts
import Scout from '@scout-ai/sdk';

const scout = new Scout();

const results = await scout.search.create({
  queries: ['best climate tech startups 2026'],
  depth: 'standard',
  country: 'us',
});

console.log(results);
```

## Examples

**Scrape a page to Markdown**

```ts
const page = await scout.page.markdown({ url: 'https://example.com' });
```

**Screenshot**

```ts
const shot = await scout.page.screenshot({
  url: 'https://example.com',
  full_page: true,
  format: 'png',
});
```

**Structured extraction**

```ts
const data = await scout.extract.create({
  urls: ['https://example.com/pricing'],
  output_schema: {
    type: 'object',
    properties: { plans: { type: 'array', items: { type: 'object' } } },
  },
});
```

**Company enrichment + logo**

```ts
const company = await scout.company.enrich({ domain: 'stripe.com' });
const logo = await scout.company.logo({ domain: 'stripe.com', format: 'svg' });
```

**Find a list of entities (find-all)**

```ts
const list = await scout.lists.create({
  query: 'Series A fintech companies in Europe',
  fields: ['name', 'website', 'hq_country'],
});
```

**Crawl a site**

```ts
const crawl = await scout.site.crawl({
  start_url: 'https://example.com',
  max_pages: 50,
  same_host_only: true,
});
```

**Chat completion grounded with web search**

```ts
const completion = await scout.chat.completions.create({
  messages: [{ role: 'user', content: 'Summarize the latest on EU AI regulation.' }],
  web_search: true,
});
```

## Error handling

Every failure is a `ScoutError`. HTTP errors map to a specific subclass by status code, each carrying `status`, `requestId`, `code`, and the parsed `body`:

```ts
import Scout, { RateLimitError, AuthenticationError, ScoutError } from '@scout-ai/sdk';

try {
  await scout.search.create({ queries: ['...'] });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log('Slow down. Retry-After:', err.headers?.['retry-after']);
  } else if (err instanceof AuthenticationError) {
    console.log('Check your API key.');
  } else if (err instanceof ScoutError) {
    console.log(err.status, err.requestId, err.message);
  }
}
```

| Status | Error class |
|--------|-------------|
| 400 | `BadRequestError` |
| 401 | `AuthenticationError` |
| 402 | `InsufficientCreditsError` |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| 422 | `UnprocessableEntityError` |
| 429 | `RateLimitError` |
| ≥500 | `InternalServerError` |
| network | `ConnectionError` / `TimeoutError` |
| aborted | `AbortError` |

## Retries

Transient failures (connection errors, timeouts, 408/409/429/5xx) are retried automatically, **2 times by default**, with exponential backoff and jitter, honoring `Retry-After`. Write methods send an auto-generated `Idempotency-Key` so retries are safe.

```ts
const scout = new Scout({ maxRetries: 4 });        // client default
await scout.search.create({ queries: ['...'] }, { maxRetries: 0 }); // per call
```

## Timeouts

Default per-request timeout is 60s. Override per client or per call:

```ts
const scout = new Scout({ timeout: 30_000 });
await scout.site.crawl({ start_url: '...' }, { timeout: 120_000 });
```

## Cancellation

Pass an `AbortSignal` to cancel in flight:

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 5_000);
await scout.search.create({ queries: ['...'] }, { signal: controller.signal });
```

## Auto-pagination

List endpoints expose an async iterator that walks every page for you:

```ts
for await (const run of scout.search.iterate()) {
  console.log(run);
}

for await (const monitor of scout.monitors.iterate()) {
  console.log(monitor);
}
```

## Advanced configuration

```ts
const scout = new Scout({
  apiKey: 'sk_...',
  baseURL: 'https://core.usescout.sh',
  timeout: 60_000,
  maxRetries: 2,
  defaultHeaders: { 'x-team': 'eng' },
  fetch: customFetch, // bring your own fetch (proxies, testing)
});
```

## Versioning

This SDK follows [SemVer](https://semver.org/). It pins the Scout API version it targets and sends it on every request; see [`CHANGELOG.md`](./CHANGELOG.md).

## Contributing

Issues and pull requests are welcome at [Scout-AI-Labs/scout-node](https://github.com/Scout-AI-Labs/scout-node).

## License

[MIT](./LICENSE)
