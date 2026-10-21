import { useId, type Ref } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
}

export function SearchBar({ value, onChange, ref }: SearchBarProps) {
  const id = useId();

  return (
    <div className={styles.search} role="search">
      <label htmlFor={id} className={styles.label}>
        Buscar por marca o modelo
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
        placeholder="Buscar por marca o modelo"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
}
