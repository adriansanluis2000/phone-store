import { Suspense, useEffect, useRef } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productListLoader } from '../features/products/application/productLoaders';
import { useSearchQuery } from '../features/products/application/useSearchQuery';
import { ProductGridSkeleton } from '../features/products/ui/ProductGridSkeleton';
import { ProductResults } from '../features/products/ui/ProductResults';
import { SearchBar } from '../features/products/ui/SearchBar';
import { LoadingState } from '../shared/ui/LoadingState';
import { PageHeader } from '../shared/ui/PageHeader';

export function ProductListPage() {
  const { products } = useLoaderData<typeof productListLoader>();
  const [query, setQuery] = useSearchQuery();
  const searchRef = useRef<HTMLInputElement>(null);

  // The detail's code downloads in the background once the list is shown
  useEffect(() => {
    import('./ProductDetailPage').catch(() => undefined);
  }, []);

  function clearQuery() {
    setQuery('');
    searchRef.current?.focus();
  }

  return (
    <>
      <title>Móviles · Phone Store</title>
      <PageHeader title="Móviles">
        <SearchBar ref={searchRef} value={query} onChange={setQuery} />
      </PageHeader>
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
              query={query}
              onClearQuery={clearQuery}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}
