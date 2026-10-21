import { createHttpClient } from './httpClient';

export const API_BASE_URL = 'https://itx-frontend-test.onrender.com';

export const apiClient = createHttpClient({
  baseUrl: API_BASE_URL,
  // The free instance behind the API takes about a minute to wake up, and
  // more than 60 s at times (docs/api-notes.md): the limit leaves margin
  timeoutMs: 90_000,
  retries: 2,
  retryDelayMs: 500,
});
