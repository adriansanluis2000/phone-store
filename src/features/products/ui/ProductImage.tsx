import { useState } from 'react';
import styles from './ProductImage.module.css';

interface ProductImageProps {
  src: string;
  /** Empty when the image is decorative, as in a card that names the product. */
  alt: string;
}

// The API serves 160 × 212 px pictures: shown at that size at most, since
// enlarging them would blur them, and sized in advance so nothing shifts
export function ProductImage({ src, alt }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={styles.fallback}>Imagen no disponible</span>;
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      width={160}
      height={212}
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
