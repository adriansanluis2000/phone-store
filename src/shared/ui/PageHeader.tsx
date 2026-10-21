import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  /** Controls shown at the top right on wide screens, such as the search. */
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 tabIndex={-1}>{title}</h1>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
