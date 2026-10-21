const euros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

/** "170 €", "170,50 €", or a notice when the product has no price. */
export function formatPrice(price: number | null): string {
  return price === null ? 'Precio no disponible' : euros.format(price);
}
