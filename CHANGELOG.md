# Changelog

All notable changes to this project are documented here. This project adheres
to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-06-21

Initial release.

- Client built on the global `fetch` (Node 18+, Deno, Bun, edge runtimes).
- Full coverage of the Scout REST API: `search`, `page`, `extract`, `company`, `lists`, `products`, `site`, `jobs`, `monitors`, `chat`.
- Typed error hierarchy (`AuthenticationError`, `RateLimitError`, `InsufficientCreditsError`, ...).
- Automatic retries with exponential backoff + jitter, honoring `Retry-After`.
- Per-request `timeout`, `maxRetries`, `headers`, `signal`, and `idempotencyKey` overrides.
- Auto-pagination iterators for list endpoints.
