import type { ReactNode } from 'react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title: string;
  message: string;
  /** Actions offered to the user, such as retrying or going back. */
  children?: ReactNode;
}

/** A page that could not be shown, with what happened and how to go on. */
export function ErrorState({ title, message, children }: ErrorStateProps) {
  return (
    <section className={styles.error}>
      <h1 tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      <p className={styles.message}>{message}</p>
      {children && <div className={styles.actions}>{children}</div>}
    </section>
  );
}
