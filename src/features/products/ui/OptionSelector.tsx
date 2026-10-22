import { useId, type ReactNode } from 'react';
import type { ProductOption } from '../domain/product';
import styles from './OptionSelector.module.css';

interface OptionSelectorProps {
  legend: string;
  options: ProductOption[];
  /** The chosen option's code, or null while none is chosen. */
  value: number | null;
  onChange: (code: number) => void;
  /** Shown before each option's name, such as a colour swatch. */
  renderBefore?: (option: ProductOption) => ReactNode;
}

/** A group of radio buttons drawn as chips, navigable with the arrow keys. */
export function OptionSelector({
  legend,
  options,
  value,
  onChange,
  renderBefore,
}: OptionSelectorProps) {
  const name = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.code} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option.code}
              checked={option.code === value}
              onChange={() => {
                onChange(option.code);
              }}
            />
            <span className={styles.chip}>
              {renderBefore?.(option)}
              {option.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
