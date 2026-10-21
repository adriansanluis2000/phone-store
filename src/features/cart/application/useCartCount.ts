import { useSyncExternalStore } from 'react';
import { readCartCount, subscribeToCartCount } from './cartStore';

export function useCartCount(): number {
  return useSyncExternalStore(subscribeToCartCount, readCartCount);
}
