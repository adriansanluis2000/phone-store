import { useState } from 'react';
import type { ProductDetail, ProductOption } from '../domain/product';
import { ColorSwatch } from './ColorSwatch';
import { OptionSelector } from './OptionSelector';
import styles from './ProductActions.module.css';

interface ProductActionsProps {
  product: ProductDetail;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [storageCode, setStorageCode] = useState(onlyOption(product.storages));
  const [colorCode, setColorCode] = useState(onlyOption(product.colors));

  return (
    <div className={styles.actions}>
      <OptionSelector
        legend="Almacenamiento"
        options={product.storages}
        value={storageCode}
        onChange={setStorageCode}
      />
      <OptionSelector
        legend="Color"
        options={product.colors}
        value={colorCode}
        onChange={setColorCode}
        renderBefore={({ name }) => <ColorSwatch name={name} />}
      />
    </div>
  );
}

// A single option is shown anyway, and comes already chosen
function onlyOption(options: ProductOption[]): number | null {
  return options.length === 1 ? (options[0]?.code ?? null) : null;
}
