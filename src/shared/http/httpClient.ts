import { HttpError, NetworkError, TimeoutError } from './errors';

export interface HttpClientOptions {
  baseUrl: string;
  /** Time limit of each attempt. */
  timeoutMs: number;
  /** Extra attempts of a GET after a network error or a 5xx. */
  retries: number;
  /** Base delay of the exponential backoff between attempts. */
  retryDelayMs: number;
}

/**
 * JSON over `fetch`. Bodies are returned as `unknown`: each API client knows
 * the shape of its responses and maps them to the domain.
 */
export interface HttpClient {
  get(path: string, signal?: AbortSignal): Promise<unknown>;
  post(path: string, body: unknown, signal?: AbortSignal): Promise<unknown>;
}

export function createHttpClient({
  baseUrl,
  timeoutMs,
  retries,
  retryDelayMs,
}: HttpClientOptions): HttpClient {
  async function send(
    path: string,
    init: RequestInit,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const url = `${baseUrl}${path}`;
    const timeout = AbortSignal.timeout(timeoutMs);
    try {
      const response = await fetch(url, {
        ...init,
        // The API needs no cookies; leaving them out makes every request
        // behave the same wherever the app is hosted (ADR 0003)
        credentials: 'omit',
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
      if (!response.ok) {
        throw new HttpError(response.status, url);
      }
      return await response.json();
    } catch (error) {
      signal?.throwIfAborted();
      if (timeout.aborted) {
        throw new TimeoutError(url, timeoutMs);
      }
      if (error instanceof TypeError) {
        throw new NetworkError(url, { cause: error });
      }
      throw error;
    }
  }

  // Equal jitter: half the delay is fixed and half random, so that many
  // clients retrying at once do not hit the server at the same instant
  function backoff(attempt: number): number {
    const delay = retryDelayMs * 2 ** attempt;
    return delay / 2 + (Math.random() * delay) / 2;
  }

  return {
    async get(path, signal) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await send(
            path,
            { headers: { Accept: 'application/json' } },
            signal,
          );
        } catch (error) {
          if (attempt === retries || !isTransient(error)) {
            throw error;
          }
          await sleep(backoff(attempt));
        }
      }
    },

    // Never retried: adding to the cart twice is not the same as adding once
    post(path, body, signal) {
      return send(
        path,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        signal,
      );
    },
  };
}

// Timeouts are not transient here: the next attempt would wait as long again
function isTransient(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    (error instanceof HttpError && error.status >= 500)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
