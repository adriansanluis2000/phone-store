import { apiClient } from '../../../shared/http/apiClient';
import type { CartItem } from '../domain/cartItem';

/** Response of `POST /api/cart`. */
interface AddToCartResponseDto {
  /** Items in the server session, which for this client is always 1 (docs/api-notes.md). */
  count: number;
}

/** Adds the item to the cart and returns the count the API answers with. */
export async function addToCart(
  item: CartItem,
  signal?: AbortSignal,
): Promise<number> {
  const response = (await apiClient.post(
    '/api/cart',
    {
      id: item.productId,
      colorCode: item.colorCode,
      storageCode: item.storageCode,
    },
    signal,
  )) as AddToCartResponseDto;
  return response.count;
}
