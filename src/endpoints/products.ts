import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createProductPrice,
  updateProductPrice,
  deleteProductPrice,
  createUserPartner,
  updateUserPartner,
  deleteUserPartner,
  createUserProductThreshold,
  updateUserProductThreshold,
  deleteUserProductThreshold,
  createUserOwnedProduct,
  updateUserOwnedProduct,
  deleteUserOwnedProduct,
} from '../db/db.js';

interface GetStreamPostsParams {
  uid: string;
}

interface ProductCreateBody {
  name: string;
  description?: string;
}

interface ProductUpdateBody {
  name?: string;
  description?: string;
}

interface ProductPriceCreateBody {
  product_id: number;
  price: number;
}

interface ProductPriceUpdateBody {
  product_id?: number;
  price?: number;
}

interface UserPartnerCreateBody {
  user_id: number;
  partner_id: number;
}

interface UserPartnerUpdateBody {
  user_id?: number;
  partner_id?: number;
}

interface UserProductThresholdCreateBody {
  user_id: number;
  product_id: number;
  upper_threshold: number;
  lower_threshold: number;
}

interface UserProductThresholdUpdateBody {
  user_id?: number;
  product_id?: number;
  upper_threshold?: number;
  lower_threshold?: number;
}

interface UserOwnedProductCreateBody {
  user_id: number;
  product_id: number;
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
}

interface UserOwnedProductUpdateBody {
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
}

interface IdParams {
  id: string;
}

const SKIP_READ_URL = process.env.SKIP_READ_URL || 'http://localhost:8080';

export default async function productRoutes(app: FastifyInstance) {
  // Product endpoints
  app.post<{ Body: ProductCreateBody }>(
    '/products',
    async (request: FastifyRequest<{ Body: ProductCreateBody }>, reply: FastifyReply) => {
      const { name, description } = request.body;
      const product = await createProduct({ name, description });
      return product;
    }
  );

  app.patch<{ Params: IdParams; Body: ProductUpdateBody }>(
    '/products/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: ProductUpdateBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const product = await updateProduct(id, request.body);
      return product;
    }
  );

  app.delete<{ Params: IdParams }>(
    '/products/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deleteProduct(id);
      return reply.status(204).send();
    }
  );

  // Product Price endpoints
  app.post<{ Body: ProductPriceCreateBody }>(
    '/product-prices',
    async (request: FastifyRequest<{ Body: ProductPriceCreateBody }>, reply: FastifyReply) => {
      const { product_id, price } = request.body;
      const productPrice = await createProductPrice({ product_id, price });
      return productPrice;
    }
  );

  app.patch<{ Params: IdParams; Body: ProductPriceUpdateBody }>(
    '/product-prices/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: ProductPriceUpdateBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const productPrice = await updateProductPrice(id, request.body);
      return productPrice;
    }
  );

  app.delete<{ Params: IdParams }>(
    '/product-prices/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deleteProductPrice(id);
      return reply.status(204).send();
    }
  );

  // User Partner endpoints
  app.post<{ Body: UserPartnerCreateBody }>(
    '/user-partners',
    async (request: FastifyRequest<{ Body: UserPartnerCreateBody }>, reply: FastifyReply) => {
      const { user_id, partner_id } = request.body;
      const userPartner = await createUserPartner({ user_id, partner_id });
      return userPartner;
    }
  );

  app.patch<{ Params: IdParams; Body: UserPartnerUpdateBody }>(
    '/user-partners/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: UserPartnerUpdateBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const userPartner = await updateUserPartner(id, request.body);
      return userPartner;
    }
  );

  app.delete<{ Params: IdParams }>(
    '/user-partners/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deleteUserPartner(id);
      return reply.status(204).send();
    }
  );

  // User Product Threshold endpoints
  app.post<{ Body: UserProductThresholdCreateBody }>(
    '/user-product-thresholds',
    async (
      request: FastifyRequest<{ Body: UserProductThresholdCreateBody }>,
      reply: FastifyReply
    ) => {
      const { user_id, product_id, upper_threshold, lower_threshold } = request.body;
      const threshold = await createUserProductThreshold({
        user_id,
        product_id,
        upper_threshold,
        lower_threshold,
      });
      return threshold;
    }
  );

  app.patch<{ Params: IdParams; Body: UserProductThresholdUpdateBody }>(
    '/user-product-thresholds/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: UserProductThresholdUpdateBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const threshold = await updateUserProductThreshold(id, request.body);
      return threshold;
    }
  );

  app.delete<{ Params: IdParams }>(
    '/user-product-thresholds/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deleteUserProductThreshold(id);
      return reply.status(204).send();
    }
  );

  // User Owned Product endpoints
  app.post<{ Body: UserOwnedProductCreateBody }>(
    '/user-owned-products',
    async (request: FastifyRequest<{ Body: UserOwnedProductCreateBody }>, reply: FastifyReply) => {
      const { user_id, product_id, quantity, purchase_price, purchase_date } = request.body;
      const ownedProduct = await createUserOwnedProduct({
        user_id,
        product_id,
        quantity,
        purchase_price,
        purchase_date,
      });
      return ownedProduct;
    }
  );

  app.put<{ Params: IdParams; Body: UserOwnedProductUpdateBody }>(
    '/user-owned-products/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: UserOwnedProductUpdateBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const ownedProduct = await updateUserOwnedProduct(id, request.body);
      return ownedProduct;
    }
  );

  app.delete<{ Params: IdParams }>(
    '/user-owned-products/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      await deleteUserOwnedProduct(id);
      return reply.status(204).send();
    }
  );

  // Stream user owned products by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/user-owned-products/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID('userOwnedProducts', uid);
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );

  // Stream all user owned products
  app.get('/streams/user-owned-products', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('userOwnedProducts');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });

  // Stream products by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/products/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID('products', uid);
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );

  // Stream all products
  app.get('/streams/products', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('products');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });

  // Stream product prices by UID
  app.get<{ Params: GetStreamPostsParams }>(
    '/streams/prices/:uid',
    async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
      const uid = Number(request.params.uid);
      const uuid = await (request.server as any).serviceBroker.getStreamUUID('prices', uid);
      return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
    }
  );

  // Stream all product prices
  app.get('/streams/prices', async (request: FastifyRequest, reply: FastifyReply) => {
    const uuid = await (request.server as any).serviceBroker.getStreamUUID('prices');
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  });
}