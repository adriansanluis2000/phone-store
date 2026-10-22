import { swatchFor } from './colorShades';
import styles from './ColorSwatch.module.css';

interface ColorSwatchProps {
  /** Colour name as the API gives it; the caller shows it next to the swatch. */
  name: string;
}

export function ColorSwatch({ name }: ColorSwatchProps) {
  const background = swatchFor(name);

  return background ? (
    <span className={styles.swatch} style={{ background }} aria-hidden="true" />
  ) : (
    <span
      className={[styles.swatch, styles.unknown].join(' ')}
      aria-hidden="true"
    />
  );
}
