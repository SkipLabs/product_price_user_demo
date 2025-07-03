import type { EagerCollection, Json, Values, Resource, Mapper } from '@skipruntime/core';

import { User, UserOwnedProduct, Product, ProductPrice } from '../db/models.js';

class UsersMapper {
  mapEntry(key: number, values: Values<User>): Iterable<[number, User]> {
    const user: User = values.getUnique();
    return [[key, user]];
  }
}

type UsersResourceInputs = {
  users: EagerCollection<number, User>;
};

type UsersResourceParams = { limit?: number };

class UsersResource implements Resource<UsersResourceInputs> {
  private limit: number;

  constructor(jsonParams: Json) {
    const params = jsonParams as UsersResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  instantiate(collections: UsersResourceInputs): EagerCollection<number, User> {
    return collections.users.take(this.limit);
  }
}

type UsersServiceInputs = Record<string, never>;

// User Owned Products with enriched data
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

class UserOwnedProductsMapper implements Mapper<number, UserOwnedProduct, number, UserOwnedProductWithDetails> {
  constructor(
    private users: EagerCollection<number, User>,
    private products: EagerCollection<number, Product>,
    private productPricesByProductId: EagerCollection<number, ProductPrice>
  ) {}

  mapEntry(key: number, values: Values<UserOwnedProduct>): Iterable<[number, UserOwnedProductWithDetails]> {
    const ownedProduct: UserOwnedProduct = values.getUnique();
    
    let user;
    try {
      user = this.users.getUnique(ownedProduct.user_id);
    } catch {
      user = {
        username: 'unknown user',
        email: 'unknown email',
      };
    }

    let product;
    let currentPrice: number | null = null;
    try {
      product = this.products.getUnique(ownedProduct.product_id);
    } catch {
      product = {
        name: 'unknown product',
        description: 'unknown description',
      };
    }

    // Get current price for this product
    try {
      const productPrice = this.productPricesByProductId.getUnique(ownedProduct.product_id);
      currentPrice = productPrice.price;
    } catch {
      // No current price found for this product
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

type UserOwnedProductsResourceInputs = {
  userOwnedProducts: EagerCollection<number, UserOwnedProductWithDetails>;
};

type UserOwnedProductsResourceParams = { limit?: number };

class UserOwnedProductsResource implements Resource<UserOwnedProductsResourceInputs> {
  private limit: number;

  constructor(jsonParams: Json) {
    const params = jsonParams as UserOwnedProductsResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

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