import type { RouteObject } from 'react-router';
import {
  productDetailLoader,
  productListLoader,
} from '../features/products/application/productLoaders';
import { ProductBreadcrumb } from '../features/products/ui/ProductBreadcrumb';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import type { BreadcrumbHandle } from '../shared/ui/Breadcrumbs';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    handle: { breadcrumb: () => 'Inicio' } satisfies BreadcrumbHandle,
    children: [
      {
        // Errors render inside the layout, which stays in place
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            loader: productListLoader,
            element: <ProductListPage />,
          },
          {
            path: 'product/:id',
            loader: productDetailLoader,
            element: <ProductDetailPage />,
            handle: {
              breadcrumb: ({ loaderData }) => (
                <ProductBreadcrumb
                  product={
                    (loaderData as ReturnType<typeof productDetailLoader>)
                      .product
                  }
                />
              ),
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
