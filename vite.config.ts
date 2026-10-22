import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

interface VercelConfig {
  headers: { source: string; headers: { key: string; value: string }[] }[];
}

// The preview server sends the same headers as production, so the end-to-end
// tests run under the real Content Security Policy (ADR 0010)
const vercel = JSON.parse(
  readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
) as VercelConfig;
const productionHeaders = Object.fromEntries(
  vercel.headers
    .filter(({ source }) => source === '/(.*)')
    .flatMap(({ headers }) => headers.map(({ key, value }) => [key, value])),
);

export default defineConfig({
  plugins: [react()],
  preview: {
    headers: productionHeaders,
  },
  test: {
    environment: 'jsdom',
    // End-to-end tests live in e2e/ and run with Playwright
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
