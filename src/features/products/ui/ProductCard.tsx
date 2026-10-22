import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { formatPrice } from '../../../shared/lib/formatPrice';
import { listSearchState } from '../application/listSearch';
import { prefetchProductDetail } from '../application/prefetchProductDetail';
import type { Product } from '../domain/product';
import styles from './ProductCard.module.css';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

// A pointer that rests this long on a card is likely to open it
const HOVER_INTENT_MS = 150;

/** The whole card is one link, named by the brand, model and price. */
export function ProductCard({ product }: ProductCardProps) {
  const { search } = useLocation();
  const hover = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(hover.current);
    },
    [],
  );

  // Fetching the detail on intent fills the cache before the click
  function prefetch() {
    prefetchProductDetail(product.id);
  }

  return (
    <Link
      to={`/product/${product.id}`}
      state={listSearchState(search)}
      className={styles.card}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          hover.current = window.setTimeout(prefetch, HOVER_INTENT_MS);
        }
      }}
      onPointerLeave={() => {
        window.clearTimeout(hover.current);
      }}
      onFocus={prefetch}
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
