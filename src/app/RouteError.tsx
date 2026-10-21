import { useRevalidator, useRouteError } from 'react-router';
import { Button, ButtonLink } from '../shared/ui/Button';
import { describeError } from '../shared/ui/describeError';
import { ErrorState } from '../shared/ui/ErrorState';

export function RouteError() {
  const { title, message } = describeError(useRouteError());
  const revalidator = useRevalidator();

  return (
    <>
      <title>{`${title} · Phone Store`}</title>
      <ErrorState title={title} message={message}>
        <Button
          onClick={() => void revalidator.revalidate()}
          disabled={revalidator.state === 'loading'}
        >
          Reintentar
        </Button>
        <ButtonLink to="/" variant="secondary">
          Ver todos los móviles
        </ButtonLink>
      </ErrorState>
    </>
  );
}
