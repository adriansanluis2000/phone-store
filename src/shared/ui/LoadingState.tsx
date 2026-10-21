import styles from './LoadingState.module.css';

interface LoadingStateProps {
  /** What is loading, shown under the spinner and read by screen readers. */
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
