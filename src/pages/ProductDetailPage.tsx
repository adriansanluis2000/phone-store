import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productDetailLoader } from '../features/products/application/productLoaders';
import { LoadingState } from '../shared/ui/LoadingState';

export function ProductDetailPage() {
  const { product } = useLoaderData<typeof productDetailLoader>();

  return (
    <Suspense fallback={<LoadingState label="Cargando producto…" />}>
      <Await resolve={product}>
        {({ brand, model }) => (
          <>
            <title>{`${brand} ${model} · Phone Store`}</title>
            <h1 tabIndex={-1}>
              {brand} {model}
            </h1>
          </>
        )}
      </Await>
    </Suspense>
  );
}
