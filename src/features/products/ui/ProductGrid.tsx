import { Link } from 'react-router';
import type { Product } from '../domain/product';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.id}>
          <Link to={`/product/${product.id}`} className={styles.link}>
            {product.brand} {product.model}
          </Link>
        </li>
      ))}
    </ul>
  );
}
