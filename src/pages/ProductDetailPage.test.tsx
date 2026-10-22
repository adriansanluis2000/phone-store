import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '../test/renderRoute';

const A700 = '/product/g18mWn2tnbOq2HJx98pTb';
const JADE = '/product/pMZMhe_ZaAPZoaCCtlDrg';

// The text of each row of the description, keyed by its term
async function findDescription() {
  const section = await screen.findByRole('region', {
    name: 'Características',
  });
  return Object.fromEntries(
    within(section)
      .getAllByRole('term')
      .map((term) => [
        term.textContent,
        [...(term.parentElement?.querySelectorAll('dd') ?? [])].map(
          (value) => value.textContent,
        ),
      ]),
  );
}

describe('product detail', () => {
  it('shows the picture next to every attribute the statement asks for', async () => {
    renderRoute(A700);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Acer Iconia Tab A700',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Acer Iconia Tab A700' }),
    ).toHaveAttribute('src', expect.stringContaining('g18mWn2tnbOq2HJx98pTb'));
    expect(
      within(screen.getByRole('article')).getByText(/^230\s€$/),
    ).toBeVisible();
    expect(await findDescription()).toEqual({
      CPU: ['Quad-core 1.3 GHz'],
      RAM: ['1 GB RAM'],
      'Sistema operativo': ['Android 4.0 (Ice Cream Sandwich)'],
      'Resolución de pantalla': ['1920 x 1200 pixels (~224 ppi pixel density)'],
      Batería: ['Non-removable Li-Ion 9800 mAh battery'],
      Cámaras: ['Principal: 5 MP, autofocus, LED flash', 'Frontal: Sí'],
      Dimensiones: ['259 x 175 x 11 mm (10.20 x 6.89 x 0.43 in)'],
      Peso: ['665 g'],
    });
  });

  it('marks the values the API does not have', async () => {
    renderRoute(JADE);

    expect(await findDescription()).toMatchObject({
      Batería: ['—No disponible'],
      Dimensiones: ['—No disponible'],
      Peso: ['—No disponible'],
    });
    expect(screen.getByText('Precio no disponible')).toBeVisible();
  });

  it('keeps the search on the way back, while Inicio leads to the whole list', async () => {
    const user = userEvent.setup();
    renderRoute('/?q=jade');
    await user.click(
      await screen.findByRole('link', { name: /Liquid Jade 2/ }),
    );
    await screen.findByRole('heading', {
      level: 1,
      name: 'Acer Liquid Jade 2',
    });

    expect(
      screen.getByRole('link', { name: 'Volver al listado' }),
    ).toHaveAttribute('href', '/?q=jade');
    expect(
      within(
        screen.getByRole('navigation', { name: 'Ruta de navegación' }),
      ).getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('href', '/');
  });

  it('leads back to the whole list when opened directly', async () => {
    renderRoute(A700);

    expect(
      await screen.findByRole('link', { name: 'Volver al listado' }),
    ).toHaveAttribute('href', '/');
  });

  it('moves the focus to the product once it loads', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(
      await screen.findByRole('link', { name: /Iconia Tab A700/ }),
    );

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Acer Iconia Tab A700',
    });
    await waitFor(() => {
      expect(heading).toHaveFocus();
    });
  });

  it('explains that a product could not be loaded', async () => {
    // Like the real API, an unknown product answers 500, which is retried
    renderRoute('/product/does-not-exist');

    expect(
      await screen.findByRole(
        'heading',
        { name: 'No hemos podido cargar la información' },
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ver todos los móviles' }),
    ).toHaveAttribute('href', '/');
  });

  it('shows a single storage and colour already chosen', async () => {
    renderRoute(JADE);

    expect(await screen.findByRole('radio', { name: '32 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black' })).toBeChecked();
  });

  it('leaves the choice to the user when there are several options', async () => {
    const user = userEvent.setup();
    renderRoute(A700);
    const storage = await screen.findByRole('group', {
      name: 'Almacenamiento',
    });
    const color = screen.getByRole('group', { name: 'Color' });

    const radios = [
      ...within(storage).getAllByRole('radio'),
      ...within(color).getAllByRole('radio'),
    ];
    expect(radios).toHaveLength(5);
    for (const radio of radios) {
      expect(radio).not.toBeChecked();
    }

    await user.click(within(storage).getByRole('radio', { name: '64 GB' }));
    await user.click(
      within(color).getByRole('radio', { name: 'Metallic Red' }),
    );

    expect(within(storage).getByRole('radio', { name: '64 GB' })).toBeChecked();
    expect(
      within(color).getByRole('radio', { name: 'Metallic Red' }),
    ).toBeChecked();
  });
});
