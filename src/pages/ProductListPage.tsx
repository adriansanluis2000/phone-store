import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productListLoader } from '../features/products/application/productLoaders';
import { useSearchQuery } from '../features/products/application/useSearchQuery';
import { ProductResults } from '../features/products/ui/ProductResults';
import { SearchBar } from '../features/products/ui/SearchBar';
import { LoadingState } from '../shared/ui/LoadingState';
import { PageHeader } from '../shared/ui/PageHeader';

export function ProductListPage() {
  const { products } = useLoaderData<typeof productListLoader>();
  const [query, setQuery] = useSearchQuery();

  return (
    <>
      <title>Móviles · Phone Store</title>
      <PageHeader title="Móviles">
        <SearchBar value={query} onChange={setQuery} />
      </PageHeader>
      <Suspense fallback={<LoadingState label="Cargando productos…" />}>
        <Await resolve={products}>
          {(list) => <ProductResults products={list} query={query} />}
        </Await>
      </Suspense>
    </>
  );
}
