import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { filterProducts } from '../domain/filterProducts';
import type { Product } from '../domain/product';
import { ProductGrid } from './ProductGrid';
import styles from './ProductResults.module.css';

interface ProductResultsProps {
  products: Product[];
  query: string;
  onClearQuery: () => void;
}

export function ProductResults({
  products,
  query,
  onClearQuery,
}: ProductResultsProps) {
  const results = filterProducts(products, query);

  return (
    <>
      <p className={styles.count} aria-live="polite">
        {describeCount(results.length, products.length)}
      </p>
      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <EmptyState
          title={`No hay móviles que coincidan con «${query.trim()}»`}
          message="Prueba con otra marca o modelo, o revisa cómo lo has escrito."
        >
          <Button variant="secondary" onClick={onClearQuery}>
            Limpiar búsqueda
          </Button>
        </EmptyState>
      )}
    </>
  );
}

function describeCount(shown: number, total: number): string {
  const phones = total === 1 ? 'móvil' : 'móviles';
  return shown === total
    ? `${total.toString()} ${phones}`
    : `${shown.toString()} de ${total.toString()} ${phones}`;
}
