import type { ReactNode } from 'react';
import styles from './LoadingState.module.css';
import { ServerWakingHint } from './ServerWakingHint';

interface LoadingStateProps {
  /** What is loading, shown on screen and read by screen readers. */
  label: string;
  /** A placeholder with the shape of the content, shown instead of a spinner. */
  children?: ReactNode;
}

export function LoadingState({ label, children }: LoadingStateProps) {
  return (
    <div
      className={children ? styles.placeholder : styles.loading}
      role="status"
    >
      {!children && <span className={styles.spinner} aria-hidden="true" />}
      <p className={styles.label}>{label}</p>
      <ServerWakingHint />
      {children}
    </div>
  );
}
