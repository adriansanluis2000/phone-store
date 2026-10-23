import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
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

// The AI search function, also served by the development server, so that a key
// in .env.local and `npm start` are enough to try it (ADR 0011)
function aiSearchRoute(): Plugin {
  let env: Record<string, string> = {};
  return {
    name: 'ai-search-route',
    apply: 'serve',
    configResolved(config) {
      env = loadEnv(config.mode, config.root, '');
    },
    configureServer(server) {
      server.middlewares.use('/api/ai-search', (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        void (async () => {
          const { handleAiSearch } = (await server.ssrLoadModule(
            '/server/aiSearch.ts',
          )) as typeof import('./server/aiSearch.js');
          const response = await handleAiSearch(await toRequest(req), env);
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(await response.text());
        })().catch(next);
      });
    },
  };
}

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(name, value);
    }
  }
  return new Request(
    `http://${req.headers.host ?? 'localhost'}/api/ai-search`,
    {
      method: 'POST',
      headers,
      body: Buffer.concat(chunks),
    },
  );
}

export default defineConfig({
  plugins: [react(), aiSearchRoute()],
  preview: {
    headers: productionHeaders,
  },
  test: {
    environment: 'jsdom',
    // End-to-end tests live in e2e/ and run with Playwright
    include: ['{src,server}/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['{src,server}/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**'],
      // The layers that hold the logic: falling below these means that a
      // change came without its tests
      thresholds: {
        'src/features/*/domain/**': { lines: 90, branches: 85 },
        'src/features/*/application/**': { lines: 90, branches: 85 },
        'src/shared/**': { lines: 90, branches: 85 },
      },
    },
  },
});
