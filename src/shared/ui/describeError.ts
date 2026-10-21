import { HttpError, NetworkError, TimeoutError } from '../http/errors';

interface ErrorDescription {
  title: string;
  message: string;
}

/** Puts a failed request into words for the user. */
export function describeError(error: unknown): ErrorDescription {
  if (error instanceof TimeoutError) {
    return {
      title: 'El servidor no responde',
      message:
        'Puede estar arrancando o fuera de servicio. Vuelve a intentarlo en unos segundos.',
    };
  }
  if (error instanceof NetworkError) {
    return {
      title: 'No hay conexión con el servidor',
      message: 'Comprueba tu conexión a internet y vuelve a intentarlo.',
    };
  }
  if (error instanceof HttpError) {
    // The API also answers 500 for products that do not exist
    return {
      title: 'No hemos podido cargar la información',
      message:
        'El servidor ha devuelto un error. Puede que el producto no exista o que el servicio esté fallando.',
    };
  }
  return {
    title: 'Algo ha ido mal',
    message: 'Ha ocurrido un error inesperado. Vuelve a intentarlo.',
  };
}
