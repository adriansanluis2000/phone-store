import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
  // jsdom does not implement scrolling, which the router restores on navigation
  window.scrollTo = () => undefined;
});

afterEach(() => {
  // Testing Library only cleans up on its own when the test globals are enabled
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
