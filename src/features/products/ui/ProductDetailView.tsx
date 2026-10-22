import { useId, type ReactNode } from 'react';
import { formatPrice } from '../../../shared/lib/formatPrice';
import type { ProductDetail } from '../domain/product';
import { ProductDescription } from './ProductDescription';
import styles from './ProductDetailView.module.css';
import { ProductImage } from './ProductImage';

interface ProductDetailViewProps {
  product: ProductDetail;
  /** What the user can do with the product, shown after its description. */
  actions?: ReactNode;
}

/** Two columns on wide screens, as in the wireframe: picture | description and actions. */
export function ProductDetailView({
  product,
  actions,
}: ProductDetailViewProps) {
  const descriptionId = useId();

  return (
    <article className={styles.detail}>
      <div className={styles.media}>
        <ProductImage
          src={product.imageUrl}
          alt={`${product.brand} ${product.model}`}
          eager
        />
      </div>
      <div className={styles.info}>
        <header className={styles.header}>
          <h1 tabIndex={-1} className={styles.title}>
            <span className={styles.brand}>{product.brand}</span>{' '}
            {product.model}
          </h1>
          <p
            className={
              product.price === null
                ? [styles.price, styles.noPrice].join(' ')
                : styles.price
            }
          >
            {formatPrice(product.price)}
          </p>
        </header>
        <section aria-labelledby={descriptionId}>
          <h2 id={descriptionId} className={styles.sectionTitle}>
            Características
          </h2>
          <ProductDescription product={product} />
        </section>
        {actions}
      </div>
    </article>
  );
}
