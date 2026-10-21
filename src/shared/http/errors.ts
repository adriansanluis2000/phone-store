/** The server answered with a status outside the 2xx range. */
export class HttpError extends Error {
  override readonly name = 'HttpError';
  readonly status: number;

  constructor(status: number, url: string) {
    super(`${url} answered with status ${status.toString()}`);
    this.status = status;
  }
}

/** The request got no response at all: offline, DNS failure, CORS… */
export class NetworkError extends Error {
  override readonly name = 'NetworkError';

  constructor(url: string, options?: ErrorOptions) {
    super(`Could not reach ${url}`, options);
  }
}

/** The server did not answer within the time limit. */
export class TimeoutError extends Error {
  override readonly name = 'TimeoutError';

  constructor(url: string, timeoutMs: number) {
    super(`${url} did not answer within ${timeoutMs.toString()} ms`);
  }
}
