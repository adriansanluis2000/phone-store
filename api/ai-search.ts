import { handleAiSearch } from '../server/aiSearch.js';

// Vercel Function behind POST /api/ai-search (ADR 0011). The logic lives in
// server/, outside api/, where every file becomes a function of its own.
export function POST(request: Request): Promise<Response> {
  return handleAiSearch(request);
}
