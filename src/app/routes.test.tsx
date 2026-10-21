import { act, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../shared/http/apiClient';
import { renderRoute } from '../test/renderRoute';
import { server } from '../test/server';

describe('routes', () => {
  it('lists the products on the home page', async () => {
    renderRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Móviles' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /Acer Iconia Talk S/ }),
    ).toHaveAttribute('href', '/product/ZmGrkLRPXOTpxsU4jjAcv');
    expect(document.title).toBe('Móviles · Phone Store');
  });

  it('opens the detail of the selected product', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(
      await screen.findByRole('link', { name: /Acer Iconia Tab A700/ }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Acer Iconia Tab A700',
      }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Acer Iconia Tab A700 · Phone Store');
  });

  it('moves the focus to the heading of the new page', async () => {
    const router = renderRoute('/product/g18mWn2tnbOq2HJx98pTb');
    await screen.findByRole('heading', { name: 'Acer Iconia Tab A700' });

    await act(() => router.navigate('/'));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Móviles' }),
    ).toHaveFocus();
  });

  it('shows a page for unknown paths, with a link to the list', async () => {
    renderRoute('/does/not/exist');

    expect(
      await screen.findByRole('heading', {
        name: 'No encontramos esta página',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ver todos los móviles' }),
    ).toHaveAttribute('href', '/');
  });

  it('explains a failed load and lets the user retry', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/api/product`,
        () => new HttpResponse(null, { status: 404 }),
        { once: true },
      ),
    );
    const user = userEvent.setup();
    renderRoute('/');

    expect(
      await screen.findByRole('heading', {
        name: 'No hemos podido cargar la información',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('link', { name: /Acer Iconia Talk S/ }),
    ).toBeInTheDocument();
  });
});
