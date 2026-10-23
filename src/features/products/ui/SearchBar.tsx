import { useId, type Ref } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
  /** Also shown as the placeholder. */
  label?: string;
  maxLength?: number;
  /** For a search that waits to be sent, such as the smart search. */
  onSubmit?: () => void;
  /** While a sent search is on its way. */
  busy?: boolean;
}

export function SearchBar({
  value,
  onChange,
  ref,
  label = 'Buscar por marca o modelo',
  maxLength,
  onSubmit,
  busy = false,
}: SearchBarProps) {
  const id = useId();

  const field = (
    <>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        type="search"
        value={value}
        placeholder={label}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </>
  );

  if (!onSubmit) {
    return (
      <div className={styles.search} role="search">
        {field}
      </div>
    );
  }

  return (
    <form
      className={[styles.search, styles.sendable].join(' ')}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {field}
      <button type="submit" className={styles.submit} disabled={busy}>
        {busy ? (
          // Same width as the label, so the field keeps its room for the text
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className={styles.label}>Buscando…</span>
          </>
        ) : (
          'Buscar'
        )}
      </button>
    </form>
  );
}
