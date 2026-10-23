import { useId, useState, type ReactNode } from 'react';
import { formatPrice } from '../../../shared/lib/formatPrice';
import type { ProductFilters } from '../domain/productFilters';
import styles from './FilterChips.module.css';

interface FilterChipsProps {
  filters: ProductFilters;
  /** What the search asked for that the list cannot filter. */
  unsupported: string[];
  onChange: (filters: ProductFilters) => void;
}

const list = new Intl.ListFormat('es', { type: 'conjunction' });

/** What the smart search understood, for the user to check and adjust. */
export function FilterChips({
  filters,
  unsupported,
  onChange,
}: FilterChipsProps) {
  const { brands = [], keywords = [], minPrice, maxPrice, sort } = filters;
  const empty =
    brands.length === 0 &&
    keywords.length === 0 &&
    minPrice === undefined &&
    maxPrice === undefined &&
    !sort;

  return (
    <div className={styles.summary}>
      {empty ? (
        unsupported.length === 0 && (
          <p className={styles.caption}>
            Sin filtros, se muestra todo el catálogo. Describe lo que buscas y
            pulsa Buscar.
          </p>
        )
      ) : (
        <Chips filters={filters} onChange={onChange} />
      )}
      {unsupported.length > 0 && (
        <p className={styles.note}>
          No podemos filtrar por{' '}
          {list.format(unsupported.map((item) => `«${item}»`))}: el listado solo
          conoce la marca, el modelo y el precio, el resto de características
          está en la ficha de cada móvil.
        </p>
      )}
    </div>
  );
}

function Chips({
  filters,
  onChange,
}: Pick<FilterChipsProps, 'filters' | 'onChange'>) {
  const captionId = useId();
  const { brands = [], keywords = [], minPrice, maxPrice, sort } = filters;

  return (
    <div className={styles.chips}>
      <p id={captionId} className={styles.caption}>
        Hemos entendido:
      </p>
      <ul className={styles.list} aria-labelledby={captionId}>
        {brands.map((brand) => (
          <Chip
            key={`brand-${brand}`}
            name={`Marca ${brand}`}
            onRemove={() => {
              onChange({
                ...filters,
                brands: brands.filter((b) => b !== brand),
              });
            }}
          >
            Marca: {brand}
          </Chip>
        ))}
        {keywords.map((keyword) => (
          <Chip
            key={`keyword-${keyword}`}
            name={`Palabra «${keyword}»`}
            onRemove={() => {
              onChange({
                ...filters,
                keywords: keywords.filter((k) => k !== keyword),
              });
            }}
          >
            «{keyword}»
          </Chip>
        ))}
        {minPrice !== undefined && (
          <PriceChip
            label="Desde"
            field="Precio mínimo en euros"
            value={minPrice}
            onChange={(price) => {
              onChange({ ...filters, minPrice: price });
            }}
            onRemove={() => {
              onChange({ ...filters, minPrice: undefined });
            }}
          />
        )}
        {maxPrice !== undefined && (
          <PriceChip
            label="Hasta"
            field="Precio máximo en euros"
            value={maxPrice}
            onChange={(price) => {
              onChange({ ...filters, maxPrice: price });
            }}
            onRemove={() => {
              onChange({ ...filters, maxPrice: undefined });
            }}
          />
        )}
        {sort && (
          <Chip
            name="Orden por precio"
            onRemove={() => {
              onChange({ ...filters, sort: undefined });
            }}
          >
            <button
              type="button"
              className={styles.sort}
              aria-label={`Orden: ${describeSort(sort)}. Cambiar el orden`}
              onClick={() => {
                onChange({
                  ...filters,
                  sort: sort === 'price-asc' ? 'price-desc' : 'price-asc',
                });
              }}
            >
              {describeSort(sort)}
              <svg
                className={styles.swap}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" />
              </svg>
            </button>
          </Chip>
        )}
      </ul>
    </div>
  );
}

interface ChipProps {
  /** How the remove button names the filter. */
  name: string;
  onRemove: () => void;
  children: ReactNode;
}

function Chip({ name, onRemove, children }: ChipProps) {
  return (
    <li className={styles.chip}>
      <span className={styles.content}>{children}</span>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Quitar filtro: ${name}`}
        onClick={onRemove}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </li>
  );
}

interface PriceChipProps {
  label: string;
  /** The name of the field for assistive technology. */
  field: string;
  value: number;
  onChange: (price: number) => void;
  onRemove: () => void;
}

// The field keeps what is being typed, such as an empty value on the way to a
// new price, and passes on each valid price
function PriceChip({
  label,
  field,
  value,
  onChange,
  onRemove,
}: PriceChipProps) {
  const [text, setText] = useState(value.toString());
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(value.toString());
  }

  return (
    <Chip name={`${label} ${formatPrice(value)}`} onRemove={onRemove}>
      <label className={styles.price}>
        {label}
        <input
          className={styles.priceInput}
          aria-label={field}
          type="number"
          inputMode="numeric"
          min={0}
          step={10}
          value={text}
          onChange={(event) => {
            const typed = event.target.value;
            setText(typed);
            const price = Number(typed);
            if (typed !== '' && Number.isFinite(price) && price >= 0) {
              setShown(price);
              onChange(price);
            }
          }}
        />
        €
      </label>
    </Chip>
  );
}

function describeSort(sort: NonNullable<ProductFilters['sort']>): string {
  return sort === 'price-asc' ? 'Más baratos primero' : 'Más caros primero';
}
