import { EagerCollection, Values, Mapper, Reducer, Resource, Json } from '@skipruntime/core';
import { Product, User, UserProductThreshold, ProductPrice } from '../db/models.js';

/**
 * Product with current pricing from reactive join.
 * @see https://skiplabs.io/docs/functions for reactive joins
 */
type ProductWithPrice = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Re-indexes prices by product_id for efficient lookups.
 * @see https://skiplabs.io/docs/functions for key transformation
 */
export class ProductPriceIndexMapper implements Mapper<number, ProductPrice, number, ProductPrice> {
  /**
   * Re-indexes from price.id to price.product_id for lookups.
   */
  mapEntry(key: number, values: Values<ProductPrice>): Iterable<[number, ProductPrice]> {
    const productPrice = values.getUnique();
    // Re-index by product_id
    return [[productPrice.product_id, productPrice]];
  }
}

/**
 * Reactively joins products with pricing data. Auto-updates on price changes.
 * @see https://skiplabs.io/docs/functions for reactive joins
 */
export class ProductPriceMapper implements Mapper<number, Product, number, ProductWithPrice> {
  /**
   * @param productPricesByProductId - Prices indexed by product ID
   */
  constructor(private productPricesByProductId: EagerCollection<number, ProductPrice>) {}

  /**
   * Reactively maps product with current price. Called on product/price changes.
   */
  mapEntry(key: number, values: Values<Product>): Iterable<[number, ProductWithPrice]> {
    const product: Product = values.getUnique();

    // Get current price for product
    let price: number | null = null;
    try {
      // Reactive price lookup
      const productPrice = this.productPricesByProductId.getUnique(product.id);
      price = productPrice.price;
    } catch {
      // Handle missing price gracefully
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

/** Input collections for ProductResource */
export type ProductResourceInputs = {
  productsWithPrices: EagerCollection<number, ProductWithPrice>;
};

/** ProductResource configuration parameters */
type ProductResourceParams = { limit?: number };

/**
 * Exposes paginated products with pricing to clients with reactive updates.
 * @see https://skiplabs.io/docs/resources for resource patterns
 */
export class ProductResource implements Resource<ProductResourceInputs> {
  private limit: number;

  /**
   * @param jsonParams - Configuration including pagination limits
   */
  constructor(jsonParams: Json) {
    const params = jsonParams as ProductResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  /**
   * Applies pagination limit to products collection.
   */
  instantiate(collections: ProductResourceInputs): EagerCollection<number, ProductWithPrice> {
    return collections.productsWithPrices.take(this.limit);
  }
}

/**
 * Identity mapper for dedicated price streams. Enables price monitoring.
 * @see https://skiplabs.io/docs/functions for identity mapping
 */
export class PricesMapper implements Mapper<number, ProductPrice, number, ProductPrice> {
  /**
   * Pass-through mapping for price records. Called on price changes.
   */
  mapEntry(key: number, values: Values<ProductPrice>): Iterable<[number, ProductPrice]> {
    const productPrice: ProductPrice = values.getUnique();
    return [[key, productPrice]];
  }
}

/** Input collections for PricesResource */
export type PricesResourceInputs = {
  prices: EagerCollection<number, ProductPrice>;
};

/** PricesResource configuration parameters */
type PricesResourceParams = { limit?: number };

/**
 * Exposes paginated price data to clients with reactive updates.
 * @see https://skiplabs.io/docs/resources for resource patterns
 */
export class PricesResource implements Resource<PricesResourceInputs> {
  private limit: number;

  /**
   * @param jsonParams - Configuration including pagination limits
   */
  constructor(jsonParams: Json) {
    const params = jsonParams as PricesResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  /**
   * Applies pagination limit to prices collection.
   */
  instantiate(collections: PricesResourceInputs): EagerCollection<number, ProductPrice> {
    return collections.prices.take(this.limit);
  }
}
