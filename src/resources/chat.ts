import { APIResource } from './_base.js';
import type { RequestOptions } from '../client.js';
import type { ScoutResponse, ChatParams } from '../types.js';

/** OpenAI-compatible chat completions, optionally grounded with web search. */
export class Chat extends APIResource {
  readonly completions = {
    /**
     * Create a chat completion. Shape mirrors the OpenAI Chat Completions API;
     * set `web_search: true` to ground the answer in live results.
     */
    create: (params: ChatParams, options?: RequestOptions): Promise<ScoutResponse> =>
      this.client.request({
        method: 'POST',
        path: '/v1/chat/completions',
        body: params,
        options,
      }),

    /**
     * Stream a chat completion as OpenAI-style `chat.completion.chunk` objects.
     * Read token text from `chunk.choices[0].delta.content`.
     *
     * ```ts
     * for await (const chunk of scout.chat.completions.stream({ messages })) {
     *   process.stdout.write(chunk.choices?.[0]?.delta?.content ?? '');
     * }
     * ```
     */
    stream: (params: ChatParams, options?: RequestOptions): AsyncGenerator<ScoutResponse> =>
      this.streamCompletion(params, options),
  };

  private async *streamCompletion(
    params: ChatParams,
    options?: RequestOptions,
  ): AsyncGenerator<ScoutResponse, void, unknown> {
    const events = this.client.stream({
      method: 'POST',
      path: '/v1/chat/completions',
      body: { ...params, stream: true },
      options,
    });
    for await (const evt of events) {
      if (evt.data === '[DONE]') return;
      yield JSON.parse(evt.data) as ScoutResponse;
    }
  }
}
