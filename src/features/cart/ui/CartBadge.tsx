import { useState } from 'react';
import { useCartCount } from '../application/useCartCount';
import styles from './CartBadge.module.css';

export function CartBadge() {
  const count = useCartCount();
  // Only changes after the first render are worth a bump
  const [initialCount] = useState(count);
  const items = count === 1 ? 'producto' : 'productos';

  return (
    <div
      className={styles.cart}
      role="status"
      aria-label={`Carrito: ${count.toString()} ${items}`}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      <span
        key={count}
        className={
          count === initialCount
            ? styles.count
            : [styles.count, styles.bump].join(' ')
        }
      >
        {count}
      </span>
    </div>
  );
}
