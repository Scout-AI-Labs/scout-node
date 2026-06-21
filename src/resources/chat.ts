import { APIResource } from './_base.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, ChatParams } from '../types.js';

/** OpenAI-compatible chat completions, optionally grounded with web search. */
export class Chat extends APIResource {
  readonly completions = {
    /**
     * Create a chat completion. Shape mirrors the OpenAI Chat Completions API;
     * set `web_search: true` to ground the answer in live results.
     *
     * Note: streaming (`stream: true`) returns the raw response envelope in
     * this release — consume `/v1/chat/completions` directly for SSE.
     */
    create: (params: ChatParams, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'POST',
        path: '/v1/chat/completions',
        body: params,
        options,
      }),
  };
}
