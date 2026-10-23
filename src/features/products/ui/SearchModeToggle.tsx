import styles from './SearchModeToggle.module.css';

interface SearchModeToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
}

/** Switches between the text search and the smart search. */
export function SearchModeToggle({ on, onChange }: SearchModeToggleProps) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={styles.toggle}
        onClick={() => {
          onChange(!on);
        }}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M11 2.5 12.9 8l5.6 2-5.6 2L11 17.5 9.1 12 3.5 10l5.6-2L11 2.5Zm7.5 11 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
        </svg>
        Búsqueda inteligente
      </button>
    </div>
  );
}
