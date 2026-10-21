import { act, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../test/renderRoute';

async function findBreadcrumbs() {
  return screen.findByRole('navigation', { name: 'Ruta de navegación' });
}

describe('header', () => {
  it('links the store name to the product list', async () => {
    renderRoute('/product/g18mWn2tnbOq2HJx98pTb');

    expect(
      await screen.findByRole('link', { name: 'Phone Store' }),
    ).toHaveAttribute('href', '/');
  });

  it('shows the list as the current page of the breadcrumbs', async () => {
    renderRoute('/');
    const breadcrumbs = await findBreadcrumbs();

    expect(within(breadcrumbs).getByText('Inicio')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(breadcrumbs).queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the product after a link to the list on the detail', async () => {
    renderRoute('/product/g18mWn2tnbOq2HJx98pTb');
    const breadcrumbs = await findBreadcrumbs();

    expect(
      within(breadcrumbs).getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('href', '/');
    expect(
      await within(breadcrumbs).findByText('Acer Iconia Tab A700'),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('shows an empty cart on the first visit', async () => {
    renderRoute('/');

    expect(
      await screen.findByRole('status', { name: 'Carrito: 0 productos' }),
    ).toHaveTextContent('0');
  });

  it('shows the saved cart count and follows changes from other tabs', async () => {
    localStorage.setItem('phone-store:cart-count', '1');
    renderRoute('/');
    expect(
      await screen.findByRole('status', { name: 'Carrito: 1 producto' }),
    ).toBeInTheDocument();
    // A synchronous act() does not commit while the page is still suspended
    await screen.findByRole('link', { name: /Acer Iconia Talk S/ });

    act(() => {
      localStorage.setItem('phone-store:cart-count', '3');
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'phone-store:cart-count' }),
      );
    });

    expect(
      screen.getByRole('status', { name: 'Carrito: 3 productos' }),
    ).toHaveTextContent('3');
  });
});
