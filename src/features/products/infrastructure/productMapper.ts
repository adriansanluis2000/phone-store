import type { Product, ProductDetail } from '../domain/product';
import type { ProductDetailDto, ProductListItemDto } from './productDto';

export function toProduct(dto: ProductListItemDto): Product {
  return {
    id: dto.id,
    brand: dto.brand,
    model: dto.model,
    price: toNumber(dto.price),
    imageUrl: dto.imgUrl,
  };
}

export function toProductDetail(dto: ProductDetailDto): ProductDetail {
  return {
    ...toProduct(dto),
    cpu: toText(dto.cpu),
    ram: toText(dto.ram),
    os: toText(dto.os),
    screenResolution: toText(dto.displaySize),
    battery: toText(dto.battery),
    primaryCamera: toText(dto.primaryCamera),
    secondaryCamera: toText(dto.secondaryCmera),
    dimensions: toText(dto.dimentions),
    weightGrams: toNumber(dto.weight),
    colors: dto.options.colors,
    storages: dto.options.storages,
  };
}

// The API splits some texts on commas into lists, sometimes with empty items,
// so joining them back restores the original text. Empty values and the "-"
// placeholder mean the value is unknown.
function toText(value: string | string[]): string | null {
  const text = Array.isArray(value)
    ? value.filter((item) => item.trim() !== '').join(', ')
    : value.trim();
  return text === '' || text === '-' ? null : text;
}

function toNumber(value: string): number | null {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) ? number : null;
}
