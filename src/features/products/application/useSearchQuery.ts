import { useSearchParams } from 'react-router';

const PARAM = 'q';

/**
 * The search term, kept in the URL so that it survives a visit to a product
 * and can be shared. Each change replaces the history entry instead of adding
 * one per keystroke (ADR 0006).
 */
export function useSearchQuery(): [string, (query: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  function setQuery(query: string) {
    setSearchParams(
      (params) => {
        if (query.trim() === '') {
          params.delete(PARAM);
        } else {
          params.set(PARAM, query);
        }
        return params;
      },
      // Synchronous, so the input keeps up with typing, and without scrolling to the top
      { replace: true, flushSync: true, preventScrollReset: true },
    );
  }

  return [searchParams.get(PARAM) ?? '', setQuery];
}
