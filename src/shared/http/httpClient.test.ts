import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/server';
import { HttpError, NetworkError, TimeoutError } from './errors';
import { createHttpClient } from './httpClient';

const BASE_URL = 'https://api.test';

const client = createHttpClient({
  baseUrl: BASE_URL,
  timeoutMs: 100,
  retries: 2,
  retryDelayMs: 1,
});

// Serves the given responses in order and counts the requests
function respondInSequence(
  method: 'get' | 'post',
  path: string,
  ...responses: (() => Response | Promise<Response>)[]
) {
  const calls = { count: 0 };
  server.use(
    http[method](`${BASE_URL}${path}`, () => {
      const respond = responses[Math.min(calls.count, responses.length - 1)];
      calls.count++;
      return respond?.();
    }),
  );
  return calls;
}

const serverError = () => new HttpResponse(null, { status: 503 });

describe('httpClient', () => {
  describe('get', () => {
    it('returns the parsed JSON body', async () => {
      respondInSequence('get', '/items', () => HttpResponse.json([1, 2]));

      await expect(client.get('/items')).resolves.toEqual([1, 2]);
    });

    it('retries network errors and server errors up to twice', async () => {
      const calls = respondInSequence(
        'get',
        '/items',
        () => HttpResponse.error(),
        serverError,
        () => HttpResponse.json([1]),
      );

      await expect(client.get('/items')).resolves.toEqual([1]);
      expect(calls.count).toBe(3);
    });

    it('fails with the last error once the retries run out', async () => {
      const calls = respondInSequence(
        'get',
        '/items',
        serverError,
        serverError,
        () => HttpResponse.error(),
      );

      await expect(client.get('/items')).rejects.toBeInstanceOf(NetworkError);
      expect(calls.count).toBe(3);
    });

    it('does not retry client errors', async () => {
      const calls = respondInSequence(
        'get',
        '/items',
        () => new HttpResponse(null, { status: 404 }),
      );

      const error: unknown = await client
        .get('/items')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('status', 404);
      expect(calls.count).toBe(1);
    });

    it('fails with a timeout error without retrying', async () => {
      const calls = respondInSequence('get', '/items', async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      });

      await expect(client.get('/items')).rejects.toBeInstanceOf(TimeoutError);
      expect(calls.count).toBe(1);
    });

    it('rejects with the abort reason when the caller aborts', async () => {
      let arrive = () => undefined;
      const requestArrived = new Promise((resolve) => {
        arrive = () => {
          resolve(undefined);
        };
      });
      const calls = respondInSequence('get', '/items', async () => {
        arrive();
        await delay('infinite');
        return HttpResponse.json([]);
      });
      const controller = new AbortController();

      const request = client.get('/items', controller.signal);
      await requestArrived;
      controller.abort();

      await expect(request).rejects.toHaveProperty('name', 'AbortError');
      expect(calls.count).toBe(1);
    });
  });

  describe('post', () => {
    it('sends the body as JSON and returns the parsed response', async () => {
      let received: unknown;
      server.use(
        http.post(`${BASE_URL}/cart`, async ({ request }) => {
          received = {
            contentType: request.headers.get('Content-Type'),
            body: await request.json(),
          };
          return HttpResponse.json({ count: 1 });
        }),
      );

      await expect(client.post('/cart', { id: 'a' })).resolves.toEqual({
        count: 1,
      });
      expect(received).toEqual({
        contentType: 'application/json',
        body: { id: 'a' },
      });
    });

    it('never retries', async () => {
      const calls = respondInSequence('post', '/cart', serverError);

      await expect(client.post('/cart', {})).rejects.toBeInstanceOf(HttpError);
      expect(calls.count).toBe(1);
    });
  });
});
