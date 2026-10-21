import { Suspense } from 'react';
import { Await } from 'react-router';
import type { ProductDetail } from '../domain/product';

interface ProductBreadcrumbProps {
  product: Promise<ProductDetail>;
}

/** The product's name, or a generic label while it loads or if it fails. */
export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  return (
    <Suspense fallback="Producto">
      <Await resolve={product} errorElement="Producto">
        {({ brand, model }) => `${brand} ${model}`}
      </Await>
    </Suspense>
  );
}
