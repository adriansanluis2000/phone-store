// Shapes of the API responses as documented in docs/api-notes.md, with only
// the fields the app uses.

/** Item of `GET /api/product`. */
export interface ProductListItemDto {
  id: string;
  brand: string;
  model: string;
  /** Digits, or empty when there is no price. */
  price: string;
  imgUrl: string;
}

/** A text the API sometimes splits on commas into a list. */
type TextDto = string | string[];

/** Response of `GET /api/product/:id`. */
export interface ProductDetailDto extends ProductListItemDto {
  cpu: TextDto;
  ram: TextDto;
  os: TextDto;
  /** Holds the resolution: the API swaps `displaySize` and `displayResolution`. */
  displaySize: string;
  battery: TextDto;
  primaryCamera: TextDto;
  secondaryCmera: TextDto;
  dimentions: string;
  /** Grams without unit, or empty. */
  weight: string;
  options: {
    colors: { code: number; name: string }[];
    storages: { code: number; name: string }[];
  };
}
