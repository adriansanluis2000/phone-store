// The search of the list travels with the navigation into a product, so that
// the way back leads to the same results. History keeps that state across
// reloads; a product opened from elsewhere leads back to the whole list.

interface ListSearchState {
  listSearch: string;
}

/** Navigation state for the links from the list to a product. */
export function listSearchState(search: string): ListSearchState {
  return { listSearch: search };
}

/** The list with the search the user came from, or the whole list. */
export function listHref({ state }: { state: unknown }): string {
  const search =
    typeof state === 'object' &&
    state !== null &&
    'listSearch' in state &&
    typeof state.listSearch === 'string'
      ? state.listSearch
      : '';
  return `/${search}`;
}
