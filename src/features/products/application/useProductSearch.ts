import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Product } from '../domain/product';
import type { ProductFilters } from '../domain/productFilters';
import { textSearch, type SearchStrategy } from '../domain/searchStrategy';
import {
  filtersFromParams,
  unsupportedFromParams,
  writeFilters,
  writeUnsupported,
} from './filterParams';
import { useSearchQuery } from './useSearchQuery';

const MODE = 'mode';
const SMART = 'ai';

/** Whether this build offers the smart search (ADR 0011). */
export function isSmartSearchEnabled(): boolean {
  return import.meta.env.VITE_AI_SEARCH_ENABLED === 'true';
}

// Downloads the smart search, and zod with it, only when someone uses it
const smartSearch: SearchStrategy = {
  live: false,
  interpret: async (query, catalogue, signal) => {
    const { aiSearch } = await import('../infrastructure/aiSearchApi');
    return aiSearch.interpret(query, catalogue, signal);
  },
};

export type SmartSearchStatus = 'idle' | 'searching' | 'failed';

/**
 * The search of the list: the text search of the statement, on every change,
 * or the smart search, once sent. Either way it ends in filters, and the URL
 * keeps them with the query (ADR 0006, ADR 0011).
 */
export function useProductSearch(catalogue: Product[] | Promise<Product[]>) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useSearchQuery();
  const [status, setStatus] = useState<SmartSearchStatus>('idle');
  const pending = useRef<AbortController>(null);

  const smart = isSmartSearchEnabled() && params.get(MODE) === SMART;
  const strategy: SearchStrategy = smart ? smartSearch : textSearch;
  const filters = strategy.live
    ? strategy.interpret(query)
    : filtersFromParams(params);

  useEffect(
    () => () => {
      pending.current?.abort();
    },
    [],
  );

  function update(change: (params: URLSearchParams) => void) {
    setParams(
      (current) => {
        change(current);
        return current;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  function setFilters(next: ProductFilters) {
    update((current) => writeFilters(current, next));
  }

  function setSmart(on: boolean) {
    pending.current?.abort();
    setStatus('idle');
    update((current) => {
      writeFilters(current, {});
      writeUnsupported(current, []);
      if (on) {
        current.set(MODE, SMART);
      } else {
        current.delete(MODE);
      }
    });
  }

  async function submit() {
    if (strategy.live) {
      return;
    }
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setStatus('searching');
    try {
      const { filters: found, unsupported } =
        query.trim() === ''
          ? { filters: {}, unsupported: [] }
          : await strategy.interpret(query, await catalogue, controller.signal);
      update((current) => {
        writeFilters(current, found);
        writeUnsupported(current, unsupported);
      });
      setStatus('idle');
    } catch {
      if (controller.signal.aborted) {
        return;
      }
      // Back to the text search of the statement, which always works
      setSmart(false);
      setStatus('failed');
    }
  }

  return {
    query,
    setQuery,
    filters,
    setFilters,
    unsupported: smart ? unsupportedFromParams(params) : [],
    smart,
    setSmart,
    submit,
    status,
  };
}
