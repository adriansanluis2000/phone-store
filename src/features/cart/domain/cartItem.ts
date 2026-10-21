/** A product in the chosen colour and storage, as added to the cart. */
export interface CartItem {
  productId: string;
  colorCode: number;
  storageCode: number;
}
