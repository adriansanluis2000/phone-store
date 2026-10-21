import { useEffect, useState, type ReactNode } from 'react';
import styles from './LoadingState.module.css';

/** Beyond this wait, the API is most likely waking up (docs/api-notes.md). */
export const SLOW_LOAD_MS = 3000;

interface LoadingStateProps {
  /** What is loading, shown on screen and read by screen readers. */
  label: string;
  /** A placeholder with the shape of the content, shown instead of a spinner. */
  children?: ReactNode;
}

export function LoadingState({ label, children }: LoadingStateProps) {
  const slow = useElapsed(SLOW_LOAD_MS);

  return (
    <div
      className={children ? styles.placeholder : styles.loading}
      role="status"
    >
      {!children && <span className={styles.spinner} aria-hidden="true" />}
      <p className={styles.label}>{label}</p>
      {slow && (
        <p className={styles.hint}>
          El servidor se está despertando. La primera carga puede tardar hasta
          un minuto.
        </p>
      )}
      {children}
    </div>
  );
}

function useElapsed(ms: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setElapsed(true);
    }, ms);
    return () => {
      clearTimeout(timer);
    };
  }, [ms]);

  return elapsed;
}
