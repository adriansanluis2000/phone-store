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

/** The search of the list the user came from, if they came from the list. */
export function listSearchFrom({
  state,
}: {
  state: unknown;
}): string | undefined {
  return typeof state === 'object' &&
    state !== null &&
    'listSearch' in state &&
    typeof state.listSearch === 'string'
    ? state.listSearch
    : undefined;
}

/** The list with the search the user came from, or the whole list. */
export function listHref(location: { state: unknown }): string {
  return `/${listSearchFrom(location) ?? ''}`;
}
