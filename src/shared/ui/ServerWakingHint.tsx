import { useEffect, useState } from 'react';
import styles from './ServerWakingHint.module.css';

/** Beyond this wait, the API is most likely waking up (docs/api-notes.md). */
export const SLOW_LOAD_MS = 3000;

/**
 * Says that the server is waking up once a wait has lasted SLOW_LOAD_MS.
 * Render it while waiting: the time counts from when it appears.
 */
export function ServerWakingHint() {
  const slow = useElapsed(SLOW_LOAD_MS);

  return slow ? (
    <p className={styles.hint}>
      El servidor se está despertando y puede tardar hasta un minuto.
    </p>
  ) : null;
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
