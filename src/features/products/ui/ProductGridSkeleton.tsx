import { Skeleton } from '../../../shared/ui/Skeleton';
import gridStyles from './ProductGrid.module.css';
import styles from './ProductGridSkeleton.module.css';

const CARDS = 8;

/** The shape of the grid while the products load, hidden from screen readers. */
export function ProductGridSkeleton() {
  return (
    <ul className={gridStyles.grid} aria-hidden="true">
      {Array.from({ length: CARDS }, (_, index) => (
        <li key={index} className={styles.card}>
          <Skeleton className={styles.media} />
          <div className={styles.body}>
            <Skeleton className={styles.brand} />
            <Skeleton className={styles.model} />
            <Skeleton className={styles.price} />
          </div>
        </li>
      ))}
    </ul>
  );
}
