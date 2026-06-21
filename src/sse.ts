/**
 * Server-Sent Events decoding for streaming endpoints.
 *
 * Scout streams two shapes over `text/event-stream`:
 *  - chat completions: `data: {chunk}\n\n`, terminated by `data: [DONE]`.
 *  - progress events:  `event: <type>\ndata: {json}\n\n`, with `:` keepalives.
 *
 * `decodeSSE` turns a byte stream into `{ event, data }` records, ignoring
 * comment lines and blank keepalives.
 */

export interface SSEvent {
  event?: string;
  data: string;
}

/** Parse one raw SSE block (the text between blank-line delimiters). */
function parseBlock(raw: string): SSEvent | null {
  let event: string | undefined;
  const dataLines: string[] = [];
  for (const line of raw.split('\n')) {
    if (line === '' || line.startsWith(':')) continue; // blank or comment
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') event = value;
    else if (field === 'data') dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}

/** Decode a fetch `ReadableStream` body into SSE events. */
export async function* decodeSSE(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEvent, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const evt = parseBlock(block);
        if (evt) yield evt;
      }
    }
    const tail = parseBlock(buffer.trim());
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
