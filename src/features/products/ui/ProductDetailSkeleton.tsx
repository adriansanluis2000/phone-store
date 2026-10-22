import { Skeleton } from '../../../shared/ui/Skeleton';
import detailStyles from './ProductDetailView.module.css';
import styles from './ProductDetailSkeleton.module.css';

const ROWS = 6;

/** The shape of the detail while the product loads, hidden from screen readers. */
export function ProductDetailSkeleton() {
  return (
    <div className={detailStyles.detail} aria-hidden="true">
      <Skeleton className={styles.media} />
      <div className={styles.info}>
        <Skeleton className={styles.brand} />
        <Skeleton className={styles.title} />
        <Skeleton className={styles.price} />
        {Array.from({ length: ROWS }, (_, index) => (
          <Skeleton key={index} className={styles.row} />
        ))}
      </div>
    </div>
  );
}
