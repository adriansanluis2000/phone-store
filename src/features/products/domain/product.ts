/** A product as listed in the catalogue. */
export interface Product {
  id: string;
  brand: string;
  model: string;
  /** In euros, or null when the API has no price for it. */
  price: number | null;
  imageUrl: string;
}

/** A choice offered when adding a product to the cart. */
export interface ProductOption {
  code: number;
  name: string;
}

/** Everything the detail page shows about a product. Unknown values are null. */
export interface ProductDetail extends Product {
  cpu: string | null;
  ram: string | null;
  os: string | null;
  screenResolution: string | null;
  battery: string | null;
  primaryCamera: string | null;
  secondaryCamera: string | null;
  dimensions: string | null;
  weightGrams: number | null;
  colors: ProductOption[];
  storages: ProductOption[];
}
