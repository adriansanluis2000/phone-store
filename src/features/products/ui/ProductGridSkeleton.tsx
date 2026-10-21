import gridStyles from './ProductGrid.module.css';
import styles from './ProductGridSkeleton.module.css';

const CARDS = 8;

/** The shape of the grid while the products load, hidden from screen readers. */
export function ProductGridSkeleton() {
  return (
    <ul className={gridStyles.grid} aria-hidden="true">
      {Array.from({ length: CARDS }, (_, index) => (
        <li key={index} className={styles.card}>
          <div className={styles.media} />
          <div className={styles.body}>
            <span className={styles.brand} />
            <span className={styles.model} />
            <span className={styles.price} />
          </div>
        </li>
      ))}
    </ul>
  );
}
