import { Link, useLocation } from 'react-router';
import { formatPrice } from '../../../shared/lib/formatPrice';
import { listSearchState } from '../application/listSearch';
import type { Product } from '../domain/product';
import styles from './ProductCard.module.css';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

/** The whole card is one link, named by the brand, model and price. */
export function ProductCard({ product }: ProductCardProps) {
  const { search } = useLocation();

  return (
    <Link
      to={`/product/${product.id}`}
      state={listSearchState(search)}
      className={styles.card}
    >
      <div className={styles.media}>
        <ProductImage src={product.imageUrl} alt="" />
      </div>
      <div className={styles.body}>
        <p className={styles.brand}>{product.brand}</p>
        <h2 className={styles.model}>{product.model}</h2>
        <p
          className={
            product.price === null
              ? [styles.price, styles.noPrice].join(' ')
              : styles.price
          }
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
