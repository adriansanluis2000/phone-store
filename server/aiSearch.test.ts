import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAiSearch } from './aiSearch.js';

// The Claude API is never called: the SDK client answers what each test sets
const parse = vi.hoisted(() => vi.fn());
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { parse };
  },
}));

const ENV = { ANTHROPIC_API_KEY: 'test-key' };
const SEARCH = {
  query: 'una tablet Acer por menos de 300 €, de la más barata a la más cara',
  brands: ['Acer', 'alcatel'],
  models: ['Iconia Tab 10 A3-A40', 'Liquid Zest'],
};

function request(
  body: unknown,
  origin: string | null = 'https://shop.test',
): Request {
  return new Request('https://shop.test/api/ai-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function answer(output: unknown, stopReason = 'end_turn') {
  parse.mockResolvedValueOnce({
    stop_reason: stopReason,
    parsed_output: output,
  });
}

const NOTHING = {
  brands: [],
  keywords: [],
  minPrice: null,
  maxPrice: null,
  sort: null,
  unsupported: [],
};

describe('handleAiSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    parse.mockReset();
  });

  it('turns the search into the filters the model found', async () => {
    answer({
      brands: ['acer'],
      keywords: ['Tab'],
      minPrice: null,
      maxPrice: 300,
      sort: 'price-asc',
      unsupported: [],
    });

    const response = await handleAiSearch(request(SEARCH), ENV);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      brands: ['Acer'],
      keywords: ['Tab'],
      maxPrice: 300,
      sort: 'price-asc',
    });
    expect(parse).toHaveBeenCalledOnce();
    const [params] = parse.mock.calls[0] as [Record<string, unknown>];
    expect(params).toMatchObject({
      model: 'claude-haiku-5-5',
      max_tokens: 512,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
    });
    expect(JSON.stringify(params.messages)).toContain(SEARCH.query);
    expect(JSON.stringify(params.messages)).toContain('Iconia Tab 10 A3-A40');
  });

  it('keeps only brands of the catalogue, short keywords and real prices', async () => {
    answer({
      ...NOTHING,
      brands: ['Samsung', 'ALCATEL', 'alcatel'],
      keywords: ['  ', 'liquid', 'x'.repeat(41)],
      minPrice: -5,
      maxPrice: Number.NaN,
    });

    const response = await handleAiSearch(request(SEARCH), ENV);

    await expect(response.json()).resolves.toEqual({
      brands: ['alcatel'],
      keywords: ['liquid'],
    });
  });

  it('reports what it cannot filter, and keywords found nowhere in the catalogue', async () => {
    answer({
      ...NOTHING,
      brands: ['Acer'],
      keywords: ['ACER', 'zést', 'azul'],
      unsupported: ['8 GB', ' ', '8 GB'],
    });

    const response = await handleAiSearch(request(SEARCH), ENV);

    await expect(response.json()).resolves.toEqual({
      brands: ['Acer'],
      keywords: ['ACER', 'zést'],
      unsupported: ['8 GB', 'azul'],
    });
  });

  it('uses the model of the environment when there is one', async () => {
    answer(NOTHING);

    await handleAiSearch(request(SEARCH), {
      ...ENV,
      AI_SEARCH_MODEL: 'claude-sonnet-5-5',
    });

    expect(parse.mock.calls[0]?.[0]).toMatchObject({
      model: 'claude-sonnet-5-5',
    });
  });

  it('serves only the app itself', async () => {
    for (const origin of ['https://other.test', null]) {
      const response = await handleAiSearch(request(SEARCH, origin), ENV);
      expect(response.status).toBe(403);
    }
    expect(parse).not.toHaveBeenCalled();
  });

  it('answers 503 without an API key', async () => {
    const response = await handleAiSearch(request(SEARCH), {});

    expect(response.status).toBe(503);
    expect(parse).not.toHaveBeenCalled();
  });

  it('rejects searches it cannot take', async () => {
    for (const body of [
      'not json',
      { ...SEARCH, query: '   ' },
      { ...SEARCH, query: 'a'.repeat(201) },
      { ...SEARCH, brands: [] },
    ]) {
      const response = await handleAiSearch(request(body), ENV);
      expect(response.status).toBe(400);
    }
    expect(parse).not.toHaveBeenCalled();
  });

  it('answers 502 when the model fails, refuses or gives nothing usable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    parse.mockRejectedValueOnce(new Error('overloaded'));
    answer(NOTHING, 'refusal');
    answer(null);

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await handleAiSearch(request(SEARCH), ENV);
      expect(response.status).toBe(502);
    }
  });
});
