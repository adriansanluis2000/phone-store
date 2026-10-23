import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { NavigationType } from 'react-router';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../shared/http/apiClient';
import { renderRoute } from '../test/renderRoute';
import { server } from '../test/server';

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
    const router = renderRoute('/?q=jade');
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

    // Back in history, as the browser button, so the list keeps its place
    await user.click(screen.getByRole('link', { name: 'Volver al listado' }));
    expect(
      await screen.findByRole('searchbox', {
        name: 'Buscar por marca o modelo',
      }),
    ).toHaveValue('jade');
    expect(router.state.historyAction).toBe(NavigationType.Pop);
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

  describe('adding to the cart', () => {
    function addButton() {
      return screen.getByRole('button', {
        name: /Añadir al carrito|Añadiendo/,
      });
    }

    // Records the bodies sent to the cart and answers like the real API
    function recordCart() {
      const bodies: unknown[] = [];
      server.use(
        http.post(`${API_BASE_URL}/api/cart`, async ({ request }) => {
          bodies.push(await request.json());
          return HttpResponse.json({ count: 1 });
        }),
      );
      return bodies;
    }

    it('keeps the button disabled until storage and colour are chosen', async () => {
      const user = userEvent.setup();
      renderRoute(A700);
      await user.click(await screen.findByRole('radio', { name: '64 GB' }));

      expect(addButton()).toBeDisabled();
      expect(addButton()).toHaveAccessibleDescription(
        'Elige almacenamiento y color para añadirlo.',
      );

      await user.click(screen.getByRole('radio', { name: 'Metallic Red' }));

      expect(addButton()).toBeEnabled();
    });

    it('sends the product and the chosen codes, and counts the item', async () => {
      const bodies = recordCart();
      const user = userEvent.setup();
      renderRoute(A700);
      await user.click(await screen.findByRole('radio', { name: '64 GB' }));
      await user.click(screen.getByRole('radio', { name: 'Metallic Red' }));

      await user.click(addButton());

      expect(
        await screen.findByText(
          'Añadido al carrito: Iconia Tab A700, 64 GB, Metallic Red.',
        ),
      ).toBeInTheDocument();
      expect(bodies).toEqual([
        { id: 'g18mWn2tnbOq2HJx98pTb', colorCode: 1001, storageCode: 2002 },
      ]);
      expect(
        screen.getByRole('status', { name: 'Carrito: 1 producto' }),
      ).toBeInTheDocument();
    });

    it('keeps the count after a reload and adds to it', async () => {
      recordCart();
      const user = userEvent.setup();
      renderRoute(JADE);
      await user.click(
        await screen.findByRole('button', { name: 'Añadir al carrito' }),
      );
      await screen.findByRole('status', { name: 'Carrito: 1 producto' });

      // A reload starts the app again on the same storage
      cleanup();
      renderRoute(JADE);
      expect(
        await screen.findByRole('status', { name: 'Carrito: 1 producto' }),
      ).toBeInTheDocument();

      await user.click(
        await screen.findByRole('button', { name: 'Añadir al carrito' }),
      );

      expect(
        await screen.findByRole('status', { name: 'Carrito: 2 productos' }),
      ).toBeInTheDocument();
    });

    it('sends a single request while adding', async () => {
      let requests = 0;
      let respond = () => undefined;
      server.use(
        http.post(`${API_BASE_URL}/api/cart`, () => {
          requests++;
          return new Promise<Response>((resolve) => {
            respond = () => {
              resolve(HttpResponse.json({ count: 1 }));
            };
          });
        }),
      );
      const user = userEvent.setup();
      renderRoute(JADE);
      const button = await screen.findByRole('button', {
        name: 'Añadir al carrito',
      });

      await user.dblClick(button);

      expect(addButton()).toHaveTextContent('Añadiendo…');
      expect(addButton()).toBeDisabled();
      respond();
      expect(
        await screen.findByText(/Añadido al carrito: Liquid Jade 2/),
      ).toBeInTheDocument();
      expect(requests).toBe(1);
    });

    it('explains a failed add and lets the user try again', async () => {
      // The last handler added answers first: a failure, then the usual answer
      recordCart();
      server.use(
        http.post(
          `${API_BASE_URL}/api/cart`,
          () => new HttpResponse(null, { status: 500 }),
          { once: true },
        ),
      );
      const user = userEvent.setup();
      renderRoute(JADE);

      await user.click(
        await screen.findByRole('button', { name: 'Añadir al carrito' }),
      );

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se ha podido añadir al carrito. Vuelve a intentarlo.',
      );
      expect(
        screen.getByRole('status', { name: 'Carrito: 0 productos' }),
      ).toBeInTheDocument();

      await user.click(addButton());

      expect(
        await screen.findByRole('status', { name: 'Carrito: 1 producto' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
