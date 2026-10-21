import { useEffect, useState } from 'react';
import styles from './LoadingState.module.css';

/** Beyond this wait, the API is most likely waking up (docs/api-notes.md). */
export const SLOW_LOAD_MS = 3000;

interface LoadingStateProps {
  /** What is loading, shown under the spinner and read by screen readers. */
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const slow = useElapsed(SLOW_LOAD_MS);

  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.label}>{label}</p>
      {slow && (
        <p className={styles.hint}>
          El servidor se está despertando. La primera carga puede tardar hasta
          un minuto.
        </p>
      )}
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
