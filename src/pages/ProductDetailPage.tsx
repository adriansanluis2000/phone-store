import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { addItemToCart } from '../features/cart/application/addItemToCart';
import type { productDetailLoader } from '../features/products/application/productLoaders';
import { BackToListLink } from '../features/products/ui/BackToListLink';
import { ProductActions } from '../features/products/ui/ProductActions';
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
              <ProductDetailView
                product={detail}
                actions={
                  // Features do not import each other: the page joins the
                  // product's selection with the cart (ADR 0008). Keyed by
                  // product, so the choices start afresh on another one
                  <ProductActions
                    key={detail.id}
                    product={detail}
                    onAdd={(selection) =>
                      addItemToCart({ productId: detail.id, ...selection })
                    }
                  />
                }
              />
            </>
          )}
        </Await>
      </Suspense>
    </>
  );
}
