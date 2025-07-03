import type { Context, SkipService } from '@skipruntime/core';

import { runService } from '@skipruntime/server';
import { SkipServiceBroker } from '@skipruntime/helpers';
import { postgresExternalService } from './db/db.js';
import { Post, User, Product, ProductPrice, UserOwnedProduct } from './db/models.js';
import {
  PostsMapper,
  PostsResource,
  PostsResourceInputs,
  PostsServiceInputs,
} from './mappers/postMappers.js';
import {
  ProductPriceIndexMapper,
  ProductPriceMapper,
  ProductResource,
  ProductResourceInputs,
  PricesMapper,
  PricesResource,
  PricesResourceInputs,
} from './mappers/productMappers.js';
import {
  UsersMapper,
  UsersResource,
  UsersResourceInputs,
  UserOwnedProductsMapper,
  UserOwnedProductsResource,
  UserOwnedProductsResourceInputs,
} from './mappers/userMappers.js';

// Combined service inputs and resource inputs
type CombinedServiceInputs = Record<string, never>;
type CombinedResourceInputs = PostsResourceInputs & ProductResourceInputs & UsersResourceInputs & UserOwnedProductsResourceInputs & PricesResourceInputs;

export const service: SkipService<CombinedServiceInputs, CombinedResourceInputs> = {
  initialData: {},
  resources: {
    posts: PostsResource,
    products: ProductResource,
    users: UsersResource,
    userOwnedProducts: UserOwnedProductsResource,
    prices: PricesResource,
  },
  externalServices: { postgres: postgresExternalService },
  createGraph(_inputs: CombinedServiceInputs, context: Context): CombinedResourceInputs {
    const serialIDKey = { key: { col: 'id', type: 'SERIAL' } };

    // External resources
    const posts = context.useExternalResource<number, Post>({
      service: 'postgres',
      identifier: 'posts',
      params: serialIDKey,
    });
    const users = context.useExternalResource<number, User>({
      service: 'postgres',
      identifier: 'users',
      params: serialIDKey,
    });
    const products = context.useExternalResource<number, Product>({
      service: 'postgres',
      identifier: 'products',
      params: serialIDKey,
    });
    const productPrices = context.useExternalResource<number, ProductPrice>({
      service: 'postgres',
      identifier: 'product_prices',
      params: serialIDKey,
    });
    const userOwnedProducts = context.useExternalResource<number, UserOwnedProduct>({
      service: 'postgres',
      identifier: 'user_owned_products',
      params: serialIDKey,
    });

    // Create intermediate collections
    const productPricesByProductId = productPrices.map(ProductPriceIndexMapper);

    return {
      posts: posts.map(PostsMapper, users),
      productsWithPrices: products.map(ProductPriceMapper, productPricesByProductId),
      users: users.map(UsersMapper),
      userOwnedProducts: userOwnedProducts.map(UserOwnedProductsMapper, users, products, productPricesByProductId),
      prices: productPrices.map(PricesMapper),
    };
  },
};

// Initialize Skip services
async function initializeSkipServices() {
  // Start the reactive service with specified ports
  const server = await runService(service, {
    streaming_port: 8080,
    control_port: 8081,
  });

  // Initialize the service broker for client communication
  const serviceBroker = new SkipServiceBroker({
    host: 'localhost',
    control_port: 8081,
    streaming_port: 8080,
  });

  return { server, serviceBroker };
}

// Export the service initialization function
export { initializeSkipServices };
