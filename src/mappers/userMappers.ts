import type { EagerCollection, Json, Values, Resource, Mapper } from '@skipruntime/core';

import { User, UserOwnedProduct, Product, ProductPrice } from '../db/models.js';

/**
 * Identity mapper for user data. Provides reactive stream of user changes.
 * @see https://skiplabs.io/docs/functions for identity mapping
 */
class UsersMapper {
  /**
   * Pass-through mapping for user records. Called on user changes.
   */
  mapEntry(key: number, values: Values<User>): Iterable<[number, User]> {
    const user: User = values.getUnique();
    return [[key, user]];
  }
}

/** Input collections for UsersResource */
type UsersResourceInputs = {
  users: EagerCollection<number, User>;
};

/** UsersResource configuration parameters */
type UsersResourceParams = { limit?: number };

/**
 * Exposes paginated user data to clients with reactive updates.
 * @see https://skiplabs.io/docs/resources for resource patterns
 */
class UsersResource implements Resource<UsersResourceInputs> {
  private limit: number;

  /**
   * @param jsonParams - Configuration including pagination limits
   */
  constructor(jsonParams: Json) {
    const params = jsonParams as UsersResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  /**
   * Applies pagination limit to users collection.
   */
  instantiate(collections: UsersResourceInputs): EagerCollection<number, User> {
    return collections.users.take(this.limit);
  }
}

type UsersServiceInputs = Record<string, never>;

/**
 * Enriched ownership data from three-way join: users, products, prices.
 * @see https://skiplabs.io/docs/functions for multi-way joins
 */
type UserOwnedProductWithDetails = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    email: string;
  };
  product: {
    name: string;
    description: string;
    current_price: number | null;
  };
};

/**
 * Multi-way reactive join: ownership + user + product + price data.
 * Auto-updates when any related data changes.
 * @see https://skiplabs.io/docs/functions for multi-way joins
 */
class UserOwnedProductsMapper implements Mapper<number, UserOwnedProduct, number, UserOwnedProductWithDetails> {
  /**
   * @param users - Users indexed by ID
   * @param products - Products indexed by ID  
   * @param productPricesByProductId - Prices indexed by product ID
   */
  constructor(
    private users: EagerCollection<number, User>,
    private products: EagerCollection<number, Product>,
    private productPricesByProductId: EagerCollection<number, ProductPrice>
  ) {}

  /**
   * Reactively enriches ownership with user/product/price data.
   */
  mapEntry(key: number, values: Values<UserOwnedProduct>): Iterable<[number, UserOwnedProductWithDetails]> {
    const ownedProduct: UserOwnedProduct = values.getUnique();
    
    let user;
    try {
      // Join with users
      user = this.users.getUnique(ownedProduct.user_id);
    } catch {
      // Handle missing user
      user = {
        username: 'unknown user',
        email: 'unknown email',
      };
    }

    let product;
    let currentPrice: number | null = null;
    try {
      // Join with products
      product = this.products.getUnique(ownedProduct.product_id);
    } catch {
      // Handle missing product
      product = {
        name: 'unknown product',
        description: 'unknown description',
      };
    }

    // Get current price (optional)
    try {
      const productPrice = this.productPricesByProductId.getUnique(ownedProduct.product_id);
      currentPrice = productPrice.price;
    } catch {
      // No current price found
      currentPrice = null;
    }

    return [
      [
        key,
        {
          id: ownedProduct.id,
          user_id: ownedProduct.user_id,
          product_id: ownedProduct.product_id,
          quantity: ownedProduct.quantity,
          purchase_price: ownedProduct.purchase_price,
          purchase_date: ownedProduct.purchase_date,
          created_at: ownedProduct.created_at,
          updated_at: ownedProduct.updated_at,
          user: {
            username: user.username,
            email: user.email,
          },
          product: {
            name: product.name,
            description: product.description,
            current_price: currentPrice,
          },
        },
      ],
    ];
  }
}

/** Input collections for UserOwnedProductsResource */
type UserOwnedProductsResourceInputs = {
  userOwnedProducts: EagerCollection<number, UserOwnedProductWithDetails>;
};

/** UserOwnedProductsResource configuration parameters */
type UserOwnedProductsResourceParams = { limit?: number };

/**
 * Exposes paginated enriched ownership data with reactive updates.
 * @see https://skiplabs.io/docs/resources for resource patterns
 */
class UserOwnedProductsResource implements Resource<UserOwnedProductsResourceInputs> {
  private limit: number;

  /**
   * @param jsonParams - Configuration including pagination limits
   */
  constructor(jsonParams: Json) {
    const params = jsonParams as UserOwnedProductsResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  /**
   * Applies pagination limit to ownership collection.
   */
  instantiate(collections: UserOwnedProductsResourceInputs): EagerCollection<number, UserOwnedProductWithDetails> {
    return collections.userOwnedProducts.take(this.limit);
  }
}

export { 
  UsersServiceInputs, 
  UsersResource, 
  UsersResourceInputs, 
  UsersMapper,
  UserOwnedProductsMapper,
  UserOwnedProductsResource,
  UserOwnedProductsResourceInputs,
  UserOwnedProductWithDetails
};