import { useState } from 'react';
import styles from './ProductImage.module.css';

interface ProductImageProps {
  src: string;
  /** Empty when the image is decorative, as in a card that names the product. */
  alt: string;
  /** Loads at once and first, for a picture visible as soon as the page opens. */
  eager?: boolean;
}

// The API serves pictures of 139 × 184 px, and a few of 160 × 212 px with the
// same proportions: all are shown at the smaller size at most, so that every
// phone looks alike and none is enlarged into a blur, and the space is kept
// before they load so nothing shifts
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
      width={139}
      height={184}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
