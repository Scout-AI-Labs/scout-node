/**
 * Offset-based auto-pagination.
 *
 * Scout's list endpoints (`/v1/searches`, `/v1/jobs`, `/v1/lists/runs`,
 * `/v1/monitors`) take `limit` + `offset`. `autoPaginate` walks every page
 * lazily so callers can `for await (const item of client.searches.iterate())`
 * without managing offsets. It stops once a page returns fewer than `limit`
 * items.
 */

const COMMON_ITEM_KEYS = [
  'items',
  'data',
  'results',
  'searches',
  'runs',
  'jobs',
  'monitors',
];

/** Pull the array of records out of a list response of unknown shape. */
export function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    for (const key of COMMON_ITEM_KEYS) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
    // Fall back to the first array-valued property.
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

export interface PaginateOptions {
  limit?: number;
  offset?: number;
}

/**
 * Yield every item across pages. `fetchPage(limit, offset)` should resolve to
 * a raw list response; the item array is extracted automatically.
 */
export async function* autoPaginate<T = unknown>(
  fetchPage: (limit: number, offset: number) => Promise<unknown>,
  options: PaginateOptions = {},
): AsyncGenerator<T, void, unknown> {
  const limit = options.limit ?? 50;
  let offset = options.offset ?? 0;
  for (;;) {
    const page = await fetchPage(limit, offset);
    const items = extractItems(page);
    for (const item of items) yield item as T;
    if (items.length < limit) return;
    offset += items.length;
  }
}
