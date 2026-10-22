import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import type { productDetailLoader } from '../features/products/application/productLoaders';
import { BackToListLink } from '../features/products/ui/BackToListLink';
import { ProductDetailSkeleton } from '../features/products/ui/ProductDetailSkeleton';
import { ProductDetailView } from '../features/products/ui/ProductDetailView';
import { LoadingState } from '../shared/ui/LoadingState';

export function ProductDetailPage() {
  const { product } = useLoaderData<typeof productDetailLoader>();

  return (
    <>
      <BackToListLink />
      <Suspense
        fallback={
          <LoadingState label="Cargando producto…">
            <ProductDetailSkeleton />
          </LoadingState>
        }
      >
        <Await resolve={product}>
          {(detail) => (
            <>
              <title>{`${detail.brand} ${detail.model} · Phone Store`}</title>
              <ProductDetailView product={detail} />
            </>
          )}
        </Await>
      </Suspense>
    </>
  );
}
