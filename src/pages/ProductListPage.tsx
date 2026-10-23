import { Suspense, useEffect, useRef } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productListLoader } from '../features/products/application/productLoaders';
import {
  isSmartSearchEnabled,
  useProductSearch,
} from '../features/products/application/useProductSearch';
import { SMART_SEARCH_MAX_LENGTH } from '../features/products/domain/searchStrategy';
import { FilterChips } from '../features/products/ui/FilterChips';
import { ProductGridSkeleton } from '../features/products/ui/ProductGridSkeleton';
import { ProductResults } from '../features/products/ui/ProductResults';
import { SearchBar } from '../features/products/ui/SearchBar';
import { SearchModeToggle } from '../features/products/ui/SearchModeToggle';
import { SmartSearchNotice } from '../features/products/ui/SmartSearchNotice';
import { Button } from '../shared/ui/Button';
import { EmptyState } from '../shared/ui/EmptyState';
import { LoadingState } from '../shared/ui/LoadingState';
import { PageHeader } from '../shared/ui/PageHeader';

export function ProductListPage() {
  const { products } = useLoaderData<typeof productListLoader>();
  const search = useProductSearch(products);
  const searchRef = useRef<HTMLInputElement>(null);

  // The detail's code downloads in the background once the list is shown
  useEffect(() => {
    import('./ProductDetailPage').catch(() => undefined);
  }, []);

  function clearQuery() {
    search.setQuery('');
    searchRef.current?.focus();
  }

  return (
    <>
      <title>Móviles · Phone Store</title>
      <PageHeader title="Móviles">
        {search.smart ? (
          <SearchBar
            ref={searchRef}
            value={search.query}
            onChange={search.setQuery}
            label="Describe lo que buscas"
            maxLength={SMART_SEARCH_MAX_LENGTH}
            onSubmit={() => {
              void search.submit();
            }}
            busy={search.status === 'searching'}
          />
        ) : (
          <SearchBar
            ref={searchRef}
            value={search.query}
            onChange={search.setQuery}
          />
        )}
      </PageHeader>
      {isSmartSearchEnabled() && (
        <SearchModeToggle on={search.smart} onChange={search.setSmart} />
      )}
      {search.smart && (
        <FilterChips
          filters={search.filters}
          unsupported={search.unsupported}
          onChange={search.setFilters}
        />
      )}
      {search.status === 'failed' && <SmartSearchNotice />}
      <Suspense
        fallback={
          <LoadingState label="Cargando productos…">
            <ProductGridSkeleton />
          </LoadingState>
        }
      >
        <Await resolve={products}>
          {(list) => (
            <ProductResults
              products={list}
              filters={search.filters}
              empty={
                search.smart ? (
                  <EmptyState
                    title="No hay móviles que cumplan estos filtros"
                    message="Quita algún filtro o describe lo que buscas de otra forma."
                  >
                    <Button
                      variant="secondary"
                      onClick={() => {
                        search.setFilters({});
                      }}
                    >
                      Quitar filtros
                    </Button>
                  </EmptyState>
                ) : (
                  <EmptyState
                    title={`No hay móviles que coincidan con «${search.query.trim()}»`}
                    message="Prueba con otra marca o modelo, o revisa cómo lo has escrito."
                  >
                    <Button variant="secondary" onClick={clearQuery}>
                      Limpiar búsqueda
                    </Button>
                  </EmptyState>
                )
              }
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}
