import { EagerCollection, Values, Mapper, Reducer, Resource, Json } from '@skipruntime/core';
import { Product, User, UserProductThreshold, ProductPrice } from '../db/models.js';

type ProductWithPrice = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  created_at: string;
  updated_at: string;
};

// First, we need a mapper to index prices by product_id
export class ProductPriceIndexMapper implements Mapper<number, ProductPrice, number, ProductPrice> {
  mapEntry(key: number, values: Values<ProductPrice>): Iterable<[number, ProductPrice]> {
    const productPrice = values.getUnique();
    // Use product_id as the key instead of the price's own id
    return [[productPrice.product_id, productPrice]];
  }
}

// Mapper to combine products with their prices
export class ProductPriceMapper implements Mapper<number, Product, number, ProductWithPrice> {
  constructor(private productPricesByProductId: EagerCollection<number, ProductPrice>) {}

  mapEntry(key: number, values: Values<Product>): Iterable<[number, ProductWithPrice]> {
    const product: Product = values.getUnique();

    // Get the price for this product using product.id as the key
    let price: number | null = null;
    try {
      const productPrice = this.productPricesByProductId.getUnique(product.id);
      price = productPrice.price;
    } catch {
      // No price found for this product
      price = null;
    }

    return [
      [
        key,
        {
          id: product.id,
          name: product.name,
          description: product.description,
          price: price,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      ],
    ];
  }
}

// Resource inputs for ProductResource
export type ProductResourceInputs = {
  productsWithPrices: EagerCollection<number, ProductWithPrice>;
};

// Resource parameters
type ProductResourceParams = { limit?: number };

// Product Resource for exposing products with price information
export class ProductResource implements Resource<ProductResourceInputs> {
  private limit: number;

  constructor(jsonParams: Json) {
    const params = jsonParams as ProductResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  instantiate(collections: ProductResourceInputs): EagerCollection<number, ProductWithPrice> {
    return collections.productsWithPrices.take(this.limit);
  }
}

// Prices mapper for dedicated prices stream
export class PricesMapper implements Mapper<number, ProductPrice, number, ProductPrice> {
  mapEntry(key: number, values: Values<ProductPrice>): Iterable<[number, ProductPrice]> {
    const productPrice: ProductPrice = values.getUnique();
    return [[key, productPrice]];
  }
}

export type PricesResourceInputs = {
  prices: EagerCollection<number, ProductPrice>;
};

type PricesResourceParams = { limit?: number };

export class PricesResource implements Resource<PricesResourceInputs> {
  private limit: number;

  constructor(jsonParams: Json) {
    const params = jsonParams as PricesResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  instantiate(collections: PricesResourceInputs): EagerCollection<number, ProductPrice> {
    return collections.prices.take(this.limit);
  }
}
