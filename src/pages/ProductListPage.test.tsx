import { act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../shared/http/apiClient';
import detail from '../test/fixtures/product-detail.json';
import products from '../test/fixtures/products.json';
import { renderRoute } from '../test/renderRoute';
import { server } from '../test/server';

function searchBox() {
  return screen.getByRole('searchbox', { name: 'Buscar por marca o modelo' });
}

// Card links are named by brand, model and price
function cards() {
  return screen.getAllByRole('link', { name: /€|Precio no disponible/ });
}

describe('product list', () => {
  it('shows every product the API returns', async () => {
    renderRoute('/');

    expect(await screen.findByText('100 móviles')).toBeInTheDocument();
    expect(cards()).toHaveLength(100);
  });

  it('filters by brand and model on every keystroke, ignoring case and accents', async () => {
    const user = userEvent.setup();
    renderRoute('/');
    await screen.findByText('100 móviles');

    await user.type(searchBox(), 'ÁCER liq');
    expect(screen.getByText('47 de 100 móviles')).toBeInTheDocument();

    await user.type(searchBox(), 'uid z6');
    expect(screen.getByText('4 de 100 móviles')).toBeInTheDocument();
    expect(cards().map((card) => card.textContent)).toEqual([
      expect.stringContaining('Liquid Z6 Plus'),
      expect.stringContaining('Liquid Z6'),
      expect.stringContaining('Liquid Z630S'),
      expect.stringContaining('Liquid Z630'),
    ]);
  });

  it('keeps the search in the URL, replacing the history entry', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/');
    await screen.findByText('100 móviles');

    await user.type(searchBox(), 'jade');

    const { location, historyAction } = router.state;
    expect(new URLSearchParams(location.search).get('q')).toBe('jade');
    expect(historyAction).toBe('REPLACE');
  });

  it('restores the search from the URL', async () => {
    renderRoute('/?q=jade');

    expect(await screen.findByText('5 de 100 móviles')).toBeInTheDocument();
    expect(searchBox()).toHaveValue('jade');
  });

  it('keeps the search after visiting a product', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/?q=iconia tab a700');
    await user.click(await screen.findByRole('link', { name: /A700/ }));
    await screen.findByRole('heading', { name: 'Acer Iconia Tab A700' });

    await act(() => router.navigate(-1));

    expect(await screen.findByText('1 de 100 móviles')).toBeInTheDocument();
    expect(searchBox()).toHaveValue('iconia tab a700');
  });

  it('filters without asking the API again', async () => {
    let requests = 0;
    server.use(
      http.get(`${API_BASE_URL}/api/product`, () => {
        requests++;
        return HttpResponse.json(products);
      }),
    );
    const user = userEvent.setup();
    renderRoute('/');
    await screen.findByText('100 móviles');

    await user.type(searchBox(), 'alcatel');

    expect(screen.getByText('1 de 100 móviles')).toBeInTheDocument();
    expect(requests).toBe(1);
  });

  it('shows the shape of the grid while loading, with the search ready', async () => {
    let respond = () => undefined;
    server.use(
      http.get(
        `${API_BASE_URL}/api/product`,
        () =>
          new Promise<Response>((resolve) => {
            respond = () => {
              resolve(HttpResponse.json(products));
            };
          }),
      ),
    );
    renderRoute('/');

    expect(await screen.findByText('Cargando productos…')).toBeInTheDocument();
    expect(searchBox()).toBeEnabled();
    expect(screen.queryAllByRole('link', { name: /€/ })).toHaveLength(0);

    respond();

    expect(await screen.findByText('100 móviles')).toBeInTheDocument();
    expect(screen.queryByText('Cargando productos…')).not.toBeInTheDocument();
  });

  it('offers to clear a search without results', async () => {
    const user = userEvent.setup();
    const router = renderRoute('/');
    await screen.findByText('100 móviles');

    await user.type(searchBox(), 'nokia');

    expect(screen.getByText('0 de 100 móviles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'No hay móviles que coincidan con «nokia»',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(screen.getByText('100 móviles')).toBeInTheDocument();
    expect(searchBox()).toHaveValue('');
    expect(searchBox()).toHaveFocus();
    expect(router.state.location.search).toBe('');
  });

  it('fetches the detail of a product the pointer rests on', async () => {
    let requests = 0;
    server.use(
      http.get(`${API_BASE_URL}/api/product/g18mWn2tnbOq2HJx98pTb`, () => {
        requests++;
        return HttpResponse.json(detail);
      }),
    );
    const user = userEvent.setup();
    renderRoute('/');
    const card = await screen.findByRole('link', { name: /Iconia Tab A700/ });

    await user.hover(card);
    await waitFor(() => {
      expect(requests).toBe(1);
    });

    await user.click(card);
    expect(
      await screen.findByRole('heading', { name: 'Acer Iconia Tab A700' }),
    ).toBeInTheDocument();
    expect(requests).toBe(1);
  });
});

describe('smart search', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AI_SEARCH_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function smartSearchBox() {
    return screen.getByRole('searchbox', { name: /Describe lo que buscas/ });
  }

  // The AI search function, answering the filters a test sets
  function answerWith(response: Response) {
    const requests: unknown[] = [];
    server.use(
      http.post('/api/ai-search', async ({ request }) => {
        requests.push(await request.json());
        return response.clone();
      }),
    );
    return requests;
  }

  it('is offered only when the build enables it', async () => {
    vi.stubEnv('VITE_AI_SEARCH_ENABLED', '');
    renderRoute('/');
    await screen.findByText('100 móviles');

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('turns a description into filters the user can adjust', async () => {
    const requests = answerWith(
      HttpResponse.json({
        keywords: ['liquid'],
        maxPrice: 150,
        sort: 'price-asc',
      }),
    );
    const user = userEvent.setup();
    const router = renderRoute('/');
    await screen.findByText('100 móviles');

    await user.click(
      screen.getByRole('switch', { name: 'Búsqueda inteligente' }),
    );
    await user.type(
      smartSearchBox(),
      'un liquid barato de menos de 150{Enter}',
    );

    expect(await screen.findByText('22 de 100 móviles')).toBeInTheDocument();
    expect(requests).toEqual([
      {
        query: 'un liquid barato de menos de 150',
        brands: ['Acer', 'alcatel'],
        models: expect.arrayContaining(['Liquid Z6 Plus']) as unknown,
      },
    ]);
    expect(cards()[0]).toHaveTextContent('70 €');
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('mode')).toBe('ai');
    expect(params.getAll('kw')).toEqual(['liquid']);
    expect(params.get('max')).toBe('150');

    await user.click(screen.getByRole('button', { name: /Cambiar el orden/ }));
    await waitFor(() => {
      expect(cards()[0]).toHaveTextContent('150 €');
    });

    const maxPrice = screen.getByRole('spinbutton', {
      name: 'Precio máximo en euros',
    });
    await user.clear(maxPrice);
    await user.type(maxPrice, '100');
    expect(await screen.findByText('12 de 100 móviles')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Quitar filtro: Palabra «liquid»' }),
    );
    expect(await screen.findByText('24 de 100 móviles')).toBeInTheDocument();
    expect(
      new URLSearchParams(router.state.location.search).getAll('kw'),
    ).toEqual([]);
  });

  it('answers a search already made from the cache', async () => {
    const requests = answerWith(HttpResponse.json({ keywords: ['liquid'] }));
    const user = userEvent.setup();
    renderRoute('/?mode=ai');
    await screen.findByText('100 móviles');

    await user.type(smartSearchBox(), 'liquid{Enter}');
    await screen.findByText('47 de 100 móviles');
    await user.click(
      screen.getByRole('button', { name: 'Quitar filtro: Palabra «liquid»' }),
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('47 de 100 móviles')).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it('restores the filters from the URL without asking again', async () => {
    renderRoute('/?mode=ai&q=liquid%20barato&kw=liquid&max=150&sort=price-asc');

    expect(await screen.findByText('22 de 100 móviles')).toBeInTheDocument();
    expect(smartSearchBox()).toHaveValue('liquid barato');
    expect(
      screen.getByRole('list', { name: 'Hemos entendido:' }),
    ).toBeVisible();
  });

  it('says what it cannot filter, also after a visit to a product', async () => {
    answerWith(
      HttpResponse.json({
        brands: ['Acer'],
        maxPrice: 250,
        unsupported: ['azul', '8 GB'],
      }),
    );
    const user = userEvent.setup();
    renderRoute('/?mode=ai');
    await screen.findByText('100 móviles');

    await user.type(smartSearchBox(), 'un acer azul de 8 GB{Enter}');

    const notice = await screen.findByText(/No podemos filtrar por/);
    expect(notice).toHaveTextContent(
      'No podemos filtrar por «azul» y «8 GB»: el listado solo conoce la marca, el modelo y el precio',
    );
    expect(screen.getByText('85 de 100 móviles')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Iconia Tab A700/ }));
    await user.click(
      await screen.findByRole('link', { name: 'Volver al listado' }),
    );
    expect(await screen.findByText(/No podemos filtrar por/)).toBeVisible();
  });

  it('falls back to the text search when the smart search fails', async () => {
    answerWith(HttpResponse.json({ error: 'not configured' }, { status: 503 }));
    const user = userEvent.setup();
    renderRoute('/?mode=ai');
    await screen.findByText('100 móviles');

    await user.type(smartSearchBox(), 'jade{Enter}');

    expect(
      await screen.findByText(/La búsqueda inteligente no está disponible/),
    ).toBeInTheDocument();
    // The switch turns off once the URL leaves the smart search
    expect(
      await screen.findByRole('switch', { checked: false }),
    ).toBeInTheDocument();
    expect(searchBox()).toHaveValue('jade');
    expect(screen.getByText('5 de 100 móviles')).toBeInTheDocument();
  });
});
