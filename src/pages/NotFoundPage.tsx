import { ButtonLink } from '../shared/ui/Button';
import { ErrorState } from '../shared/ui/ErrorState';

export function NotFoundPage() {
  return (
    <>
      <title>Página no encontrada · Phone Store</title>
      <ErrorState
        title="No encontramos esta página"
        message="Puede que el enlace esté mal escrito o que la página ya no exista."
      >
        <ButtonLink to="/">Ver todos los móviles</ButtonLink>
      </ErrorState>
    </>
  );
}
