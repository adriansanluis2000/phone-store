import type { LoaderFunctionArgs } from 'react-router';
import { getProductDetail, getProducts } from '../infrastructure/productApi';

// Loaders start the request and return it unresolved: the page renders at
// once and suspends only where it needs the data (ADR 0005)

export function productListLoader({ request }: LoaderFunctionArgs) {
  return { products: handledLater(getProducts(request.signal)) };
}

export function productDetailLoader({ params, request }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Error('The product detail route needs an id');
  }
  return { product: handledLater(getProductDetail(id, request.signal)) };
}

// The page handles a failure when it renders, which can come after a fast
// rejection: an early no-op handler keeps it from being reported as unhandled
function handledLater<T>(promise: Promise<T>): Promise<T> {
  promise.catch(() => undefined);
  return promise;
}
