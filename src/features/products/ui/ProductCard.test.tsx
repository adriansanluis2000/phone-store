import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Product } from '../domain/product';
import { ProductCard } from './ProductCard';

const product: Product = {
  id: 'ZmGrkLRPXOTpxsU4jjAcv',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: 170,
  imageUrl: 'https://example.com/ZmGrkLRPXOTpxsU4jjAcv.jpg',
};

function renderCard(item: Product) {
  const Stub = createRoutesStub([
    { path: '/', Component: () => <ProductCard product={item} /> },
  ]);
  render(<Stub />);
}

describe('ProductCard', () => {
  it('is a single link to the detail, named by brand, model and price', () => {
    renderCard(product);

    const link = screen.getByRole('link');
    // \s also matches the non-breaking space that Intl puts before the symbol
    expect(link).toHaveAccessibleName(/^Acer Iconia Talk S 170\s€$/);
    expect(link).toHaveAttribute('href', '/product/ZmGrkLRPXOTpxsU4jjAcv');
    expect(
      screen.getByRole('heading', { name: 'Iconia Talk S' }),
    ).toBeVisible();
  });

  it('shows the picture as decoration, lazily loaded', () => {
    renderCard(product);

    const image = screen.getByRole('presentation');
    expect(image).toHaveAttribute('src', product.imageUrl);
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('says when the price is not available', () => {
    renderCard({ ...product, price: null });

    expect(screen.getByText('Precio no disponible')).toBeVisible();
  });

  it('replaces a picture that fails to load', () => {
    renderCard(product);

    fireEvent.error(screen.getByRole('presentation'));

    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(screen.getByText('Imagen no disponible')).toBeVisible();
  });
});
