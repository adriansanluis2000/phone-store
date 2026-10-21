import { filterProducts } from '../domain/filterProducts';
import type { Product } from '../domain/product';
import { ProductGrid } from './ProductGrid';
import styles from './ProductResults.module.css';

interface ProductResultsProps {
  products: Product[];
  query: string;
}

export function ProductResults({ products, query }: ProductResultsProps) {
  const results = filterProducts(products, query);

  return (
    <>
      <p className={styles.count} aria-live="polite">
        {describeCount(results.length, products.length)}
      </p>
      <ProductGrid products={results} />
    </>
  );
}

function describeCount(shown: number, total: number): string {
  const phones = total === 1 ? 'móvil' : 'móviles';
  return shown === total
    ? `${total.toString()} ${phones}`
    : `${shown.toString()} de ${total.toString()} ${phones}`;
}
