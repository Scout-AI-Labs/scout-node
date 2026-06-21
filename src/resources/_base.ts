import type { Scout, RequestOptions } from '../client.js';
import type { ScoutResponse } from '../types.js';

/** Base class for every resource group. Holds a back-reference to the client. */
export abstract class APIResource {
  protected readonly client: Scout;
  constructor(client: Scout) {
    this.client = client;
  }

  /** Stream a Server-Sent-Events endpoint, yielding each event's parsed JSON. */
  protected async *streamSSE(
    path: string,
    options?: RequestOptions,
  ): AsyncGenerator<ScoutResponse, void, unknown> {
    for await (const evt of this.client.stream({ method: 'GET', path, options })) {
      if (evt.data === '[DONE]') return;
      yield JSON.parse(evt.data) as ScoutResponse;
    }
  }
}
