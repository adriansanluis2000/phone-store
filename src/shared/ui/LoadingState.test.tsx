import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadingState } from './LoadingState';
import { SLOW_LOAD_MS } from './ServerWakingHint';

const WAKING_UP = /el servidor se está despertando/i;

describe('LoadingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tells the user that the server is waking up once the wait gets long', () => {
    render(<LoadingState label="Cargando productos…" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Cargando productos…');

    act(() => {
      vi.advanceTimersByTime(SLOW_LOAD_MS - 1);
    });
    expect(status).not.toHaveTextContent(WAKING_UP);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(status).toHaveTextContent(WAKING_UP);
  });
});
