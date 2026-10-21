import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './Header.module.css';

interface HeaderProps {
  /** Shown on the right, such as the cart, which shared code cannot import. */
  actions: ReactNode;
}

export function Header({ actions }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <svg
            className={styles.logo}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <rect x="6" y="2.5" width="12" height="19" rx="3" />
            <path d="M10.5 18.5h3" />
          </svg>
          Phone Store
        </Link>
        <div className={styles.breadcrumbs}>
          <Breadcrumbs />
        </div>
        <div className={styles.actions}>{actions}</div>
      </div>
    </header>
  );
}
