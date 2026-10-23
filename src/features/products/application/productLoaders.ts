import type {
  LoaderFunctionArgs,
  ShouldRevalidateFunctionArgs,
} from 'react-router';
import {
  getProductDetail,
  getProducts,
  peekProducts,
} from '../infrastructure/productApi';

// Loaders start the request and return it unresolved: the page renders at
// once and suspends only where it needs the data (ADR 0005)

// Products already in the cache come as they are, so the list renders whole
// at once and going back to it can restore the scroll position, which a
// skeleton shorter than the list would cut short
export function productListLoader({ request }: LoaderFunctionArgs) {
  return {
    products: peekProducts() ?? handledLater(getProducts(request.signal)),
  };
}

// Filtering happens in the browser, so a new search term needs no new data.
// A retry keeps the same URL and still reloads (ADR 0006)
export function productListShouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const searchOnly =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search;
  return searchOnly ? false : defaultShouldRevalidate;
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
