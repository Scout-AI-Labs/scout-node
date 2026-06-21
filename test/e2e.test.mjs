// End-to-end tests against a local mock server, using the built-in node:test
// runner and node:http (no third-party packages). Run after `yarn build`:
//   node --test

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import Scout, { AuthenticationError } from '../dist/index.js';

let server;
let client;
let flaky = 0;

before(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const send = (code, obj) => {
        res.writeHead(code, {
          'content-type': 'application/json',
          'x-request-id': 'req_abc123',
        });
        res.end(JSON.stringify(obj));
      };
      const url = req.url.split('?')[0];
      const sse = (frames) => {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'x-request-id': 'req_abc123' });
        res.end(frames.join(''));
      };
      if (url === '/v1/chat/completions') {
        sse([
          'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
          'data: [DONE]\n\n',
        ]);
      } else if (url === '/v1/searches/abc/events') {
        sse([
          ': keepalive\n\n',
          'event: run.progress\ndata: {"type":"run.progress","pct":50}\n\n',
          'event: run.completed\ndata: {"type":"run.completed"}\n\n',
        ]);
      } else if (url === '/v1/search') {
        send(200, {
          ok: true,
          auth: req.headers['authorization'],
          idem: req.headers['idempotency-key'],
          echo: body ? JSON.parse(body) : {},
        });
      } else if (url === '/v1/site/crawl') {
        flaky += 1;
        if (flaky < 3) send(500, { detail: 'transient' });
        else send(200, { ok: true, tries: flaky });
      } else if (url === '/v1/company') {
        send(401, { detail: 'invalid api key' });
      } else if (url === '/v1/searches') {
        send(200, { items: [{ id: 1 }], path: req.url });
      } else {
        send(404, {});
      }
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  client = new Scout({
    apiKey: 'sk_live_xyz',
    baseURL: `http://127.0.0.1:${port}`,
    maxRetries: 3,
  });
});

after(() => server.close());

test('POST round-trip sends auth + idempotency and echoes the body', async () => {
  const res = await client.search.create({ queries: ['hello world'], depth: 'standard' });
  assert.equal(res.ok, true);
  assert.equal(res.auth, 'Bearer sk_live_xyz');
  assert.ok(res.idem);
  assert.equal(res.echo.depth, 'standard');
  assert.deepEqual(res.echo.queries, ['hello world']);
});

test('GET encodes query params', async () => {
  const res = await client.search.list({ limit: 5 });
  assert.deepEqual(res.items, [{ id: 1 }]);
  assert.match(res.path, /limit=5/);
});

test('retries on 500 then succeeds', async () => {
  const res = await client.site.crawl({ start_url: 'https://example.com' });
  assert.equal(res.ok, true);
  assert.equal(res.tries, 3);
});

test('maps 401 to AuthenticationError with request id', async () => {
  await assert.rejects(
    () => client.company.enrich({ domain: 'x.com' }),
    (err) => {
      assert.ok(err instanceof AuthenticationError);
      assert.equal(err.status, 401);
      assert.equal(err.requestId, 'req_abc123');
      assert.match(err.message, /invalid api key/);
      return true;
    },
  );
});

test('auto-pagination iterates', async () => {
  const items = [];
  for await (const item of client.search.iterate({ limit: 5 })) items.push(item);
  assert.deepEqual(items, [{ id: 1 }]);
});

test('chat completions stream yields deltas and stops at [DONE]', async () => {
  const chunks = [];
  for await (const chunk of client.chat.completions.stream({
    messages: [{ role: 'user', content: 'hi' }],
  })) {
    chunks.push(chunk.choices[0].delta.content);
  }
  assert.deepEqual(chunks, ['Hel', 'lo']);
});

test('streamEvents yields parsed progress events', async () => {
  const events = [];
  for await (const evt of client.search.streamEvents('abc')) events.push(evt.type);
  assert.deepEqual(events, ['run.progress', 'run.completed']);
});
