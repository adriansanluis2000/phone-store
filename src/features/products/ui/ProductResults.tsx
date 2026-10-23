import type { ReactNode } from 'react';
import type { Product } from '../domain/product';
import { applyFilters, type ProductFilters } from '../domain/productFilters';
import { ProductGrid } from './ProductGrid';
import styles from './ProductResults.module.css';

interface ProductResultsProps {
  products: Product[];
  filters: ProductFilters;
  /** Shown instead of the grid when no product passes the filters. */
  empty: ReactNode;
}

export function ProductResults({
  products,
  filters,
  empty,
}: ProductResultsProps) {
  const results = applyFilters(products, filters);

  return (
    <>
      <p className={styles.count} aria-live="polite">
        {describeCount(results.length, products.length)}
      </p>
      {results.length > 0 ? <ProductGrid products={results} /> : empty}
    </>
  );
}

function describeCount(shown: number, total: number): string {
  const phones = total === 1 ? 'móvil' : 'móviles';
  return shown === total
    ? `${total.toString()} ${phones}`
    : `${shown.toString()} de ${total.toString()} ${phones}`;
}
