import type { CartItem } from '../domain/cartItem';
import { addToCart } from '../infrastructure/cartApi';
import { increaseCartCount } from './cartStore';

/**
 * Adds the item through the API and adds its answer to the saved count. The
 * API counts per session, and a browser always starts a new one (ADR 0007).
 */
export async function addItemToCart(item: CartItem): Promise<void> {
  increaseCartCount(await addToCart(item));
}
