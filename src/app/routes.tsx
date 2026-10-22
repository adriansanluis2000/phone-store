import type { RouteObject } from 'react-router';
import {
  productDetailLoader,
  productListLoader,
  productListShouldRevalidate,
} from '../features/products/application/productLoaders';
import { ProductBreadcrumb } from '../features/products/ui/ProductBreadcrumb';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductListPage } from '../pages/ProductListPage';
import type { BreadcrumbHandle } from '../shared/ui/Breadcrumbs';
import { LoadingState } from '../shared/ui/LoadingState';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    handle: { breadcrumb: () => 'Inicio' } satisfies BreadcrumbHandle,
    children: [
      {
        // Errors render inside the layout, which stays in place, and so does
        // the wait for the code of a page opened directly
        errorElement: <RouteError />,
        hydrateFallbackElement: <LoadingState label="Cargando…" />,
        children: [
          {
            index: true,
            loader: productListLoader,
            shouldRevalidate: productListShouldRevalidate,
            element: <ProductListPage />,
          },
          {
            path: 'product/:id',
            loader: productDetailLoader,
            // Its code downloads on demand; the loader above starts the data at once
            lazy: async () => {
              const { ProductDetailPage } =
                await import('../pages/ProductDetailPage');
              return { Component: ProductDetailPage };
            },
            handle: {
              // The header can render before the loader has run, while the
              // code of a page opened directly is still on its way
              breadcrumb: ({ loaderData }) => {
                const data = loaderData as
                  ReturnType<typeof productDetailLoader> | undefined;
                return data ? (
                  <ProductBreadcrumb product={data.product} />
                ) : (
                  'Producto'
                );
              },
            } satisfies BreadcrumbHandle,
          },
          {
            path: '*',
            element: <NotFoundPage />,
            handle: {
              breadcrumb: () => 'Página no encontrada',
            } satisfies BreadcrumbHandle,
          },
        ],
      },
    ],
  },
];
