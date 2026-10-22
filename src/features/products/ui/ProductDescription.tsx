import type { ReactNode } from 'react';
import type { ProductDetail } from '../domain/product';
import styles from './ProductDescription.module.css';

interface ProductDescriptionProps {
  product: ProductDetail;
}

/**
 * The technical attributes the statement asks for, with unknown values
 * marked. Brand, model and price head the same column, in the product's
 * header.
 */
export function ProductDescription({ product }: ProductDescriptionProps) {
  const rows: [term: string, values: ReactNode[]][] = [
    ['CPU', [show(product.cpu)]],
    ['RAM', [show(product.ram)]],
    ['Sistema operativo', [show(product.os)]],
    ['Resolución de pantalla', [show(product.screenResolution)]],
    ['Batería', [show(product.battery)]],
    [
      'Cámaras',
      [
        <>Principal: {show(translate(product.primaryCamera))}</>,
        <>Frontal: {show(translate(product.secondaryCamera))}</>,
      ],
    ],
    ['Dimensiones', [show(product.dimensions)]],
    [
      'Peso',
      [
        show(
          product.weightGrams === null
            ? null
            : `${product.weightGrams.toString()} g`,
        ),
      ],
    ],
  ];

  return (
    <dl className={styles.list}>
      {rows.map(([term, values]) => (
        <div key={term} className={styles.row}>
          <dt className={styles.term}>{term}</dt>
          {values.map((value, index) => (
            <dd key={index} className={styles.value}>
              {value}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}

function show(value: string | null): ReactNode {
  return (
    value ?? (
      <>
        <span aria-hidden="true">—</span>
        <span className={styles.visuallyHidden}>No disponible</span>
      </>
    )
  );
}

// Some cameras are only reported as present or absent, in English
function translate(value: string | null): string | null {
  return value === 'Yes' ? 'Sí' : value;
}
