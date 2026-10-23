import { useId, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { ServerWakingHint } from '../../../shared/ui/ServerWakingHint';
import type { ProductDetail, ProductOption } from '../domain/product';
import { ColorSwatch } from './ColorSwatch';
import { OptionSelector } from './OptionSelector';
import styles from './ProductActions.module.css';

export interface ProductSelection {
  storageCode: number;
  colorCode: number;
}

interface ProductActionsProps {
  product: ProductDetail;
  /** Adds the selection to the cart; a rejection means it was not added. */
  onAdd: (selection: ProductSelection) => Promise<void>;
}

type AddState =
  | { status: 'idle' }
  | { status: 'adding' }
  | { status: 'added'; summary: string }
  | { status: 'failed' };

export function ProductActions({ product, onAdd }: ProductActionsProps) {
  const [storageCode, setStorageCode] = useState(onlyOption(product.storages));
  const [colorCode, setColorCode] = useState(onlyOption(product.colors));
  const [state, setState] = useState<AddState>({ status: 'idle' });
  const hintId = useId();
  const adding = state.status === 'adding';
  const complete = storageCode !== null && colorCode !== null;

  async function add() {
    if (storageCode === null || colorCode === null || adding) {
      return;
    }
    const summary = [
      product.model,
      nameOf(product.storages, storageCode),
      nameOf(product.colors, colorCode),
    ].join(', ');
    setState({ status: 'adding' });
    try {
      await onAdd({ storageCode, colorCode });
      setState({ status: 'added', summary });
    } catch {
      setState({ status: 'failed' });
    }
  }

  return (
    <form
      className={styles.actions}
      onSubmit={(event) => {
        event.preventDefault();
        void add();
      }}
    >
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
      <div className={styles.submit}>
        {/* While adding, unavailable but focusable: a disabled button would
            drop the keyboard focus to the start of the page */}
        <Button
          type="submit"
          disabled={!complete}
          aria-disabled={adding}
          aria-describedby={complete ? undefined : hintId}
        >
          {adding ? 'Añadiendo…' : 'Añadir al carrito'}
        </Button>
        {!complete && (
          <p id={hintId} className={styles.hint}>
            Elige almacenamiento y color para añadirlo.
          </p>
        )}
        {adding && <ServerWakingHint />}
        <p className={styles.confirmation} role="status">
          {state.status === 'added' && `Añadido al carrito: ${state.summary}.`}
        </p>
        {state.status === 'failed' && (
          <p className={styles.error} role="alert">
            No se ha podido añadir al carrito. Vuelve a intentarlo.
          </p>
        )}
      </div>
    </form>
  );
}

// A single option is shown anyway, and comes already chosen
function onlyOption(options: ProductOption[]): number | null {
  return options.length === 1 ? (options[0]?.code ?? null) : null;
}

function nameOf(options: ProductOption[], code: number): string {
  return options.find((option) => option.code === code)?.name ?? '';
}
