import { useState } from 'react';
import styles from './ProductImage.module.css';

interface ProductImageProps {
  src: string;
  /** Empty when the image is decorative, as in a card that names the product. */
  alt: string;
  /** Loads at once and first, for a picture visible as soon as the page opens. */
  eager?: boolean;
}

// The API serves 160 × 212 px pictures: shown at that size at most, since
// enlarging them would blur them, and sized in advance so nothing shifts
export function ProductImage({ src, alt, eager = false }: ProductImageProps) {
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
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
