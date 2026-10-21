import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productListLoader } from '../features/products/application/productLoaders';
import { ProductGrid } from '../features/products/ui/ProductGrid';
import { LoadingState } from '../shared/ui/LoadingState';

export function ProductListPage() {
  const { products } = useLoaderData<typeof productListLoader>();

  return (
    <>
      <title>Móviles · Phone Store</title>
      <h1 tabIndex={-1}>Móviles</h1>
      <Suspense fallback={<LoadingState label="Cargando productos…" />}>
        <Await resolve={products}>
          {(list) => <ProductGrid products={list} />}
        </Await>
      </Suspense>
    </>
  );
}
