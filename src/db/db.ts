import { Pool } from 'pg';
import type {
  Post,
  PostCreate,
  User,
  Product,
  ProductCreate,
  ProductPrice,
  ProductPriceCreate,
  UserPartner,
  UserPartnerCreate,
  UserProductThreshold,
  UserProductThresholdCreate,
  UserOwnedProduct,
  UserOwnedProductCreate,
  UserOwnedProductUpdate,
} from './models.js';
import { NotFoundError, InternalError } from '../errors.js';
import { PostgresExternalService } from '@skip-adapter/postgres';

const dbConfig = {
  user: 'skipper',
  host: 'localhost',
  database: 'skipdb',
  password: 'skipper123',
  port: 5432,
};
const pool = new Pool(dbConfig);

export const postgresExternalService = new PostgresExternalService(dbConfig);

export async function getUsers(): Promise<User[]> {
  const result = await pool.query('SELECT * FROM users');
  if (!Array.isArray(result.rows)) {
    throw new InternalError('Database returned invalid user data');
  }
  return result.rows;
}

export async function getUserById(id: string): Promise<User> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user ID format');
  }
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!result.rows[0]) {
    throw new NotFoundError(`User not found: ${id}`);
  }

  return result.rows[0];
}

export async function getPostById(id: string): Promise<Post> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid post ID format');
  }
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  if (!result.rows[0]) {
    throw new NotFoundError(`Post not found: ${id}`);
  }
  return result.rows[0];
}

export async function createPost(post: PostCreate): Promise<Post> {
  const result = await pool.query(
    'INSERT INTO posts (title, content, author_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [post.title, post.content, post.author_id, post.status]
  );
  return result.rows[0];
}

export async function publishPost(id: string): Promise<Post> {
  const publishedAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const result = await pool.query(
    'UPDATE posts SET status = $1, published_at = $2, updated_at = $3 WHERE id = $4 RETURNING *',
    ['published', publishedAt, updatedAt, id]
  );
  return result.rows[0];
}

export async function unpublishPost(id: string): Promise<Post> {
  const updatedAt = new Date().toISOString();
  const result = await pool.query(
    'UPDATE posts SET status = $1, published_at = NULL, updated_at = $2 WHERE id = $3 RETURNING *',
    ['draft', updatedAt, id]
  );
  return result.rows[0];
}

export async function deletePost(id: string): Promise<void> {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}

// Product functions
export async function createProduct(product: ProductCreate): Promise<Product> {
  const result = await pool.query(
    'INSERT INTO products (name, description) VALUES ($1, $2) RETURNING *',
    [product.name, product.description || '']
  );
  const row = result.rows[0];
  return {
    ...row,
    description: row.description || '',
  };
}

export async function updateProduct(id: string, product: Partial<ProductCreate>): Promise<Product> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid product ID format');
  }
  const updatedAt = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (product.name !== undefined) {
    setParts.push(`name = $${paramCount++}`);
    values.push(product.name);
  }
  if (product.description !== undefined) {
    setParts.push(`description = $${paramCount++}`);
    values.push(product.description);
  }
  setParts.push(`updated_at = $${paramCount++}`);
  values.push(updatedAt);
  values.push(id);

  const result = await pool.query(
    `UPDATE products SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw new NotFoundError(`Product not found: ${id}`);
  }
  const row = result.rows[0];
  return {
    ...row,
    description: row.description || '',
  };
}

export async function deleteProduct(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid product ID format');
  }
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

// Product Price functions
export async function createProductPrice(productPrice: ProductPriceCreate): Promise<ProductPrice> {
  const result = await pool.query(
    'INSERT INTO product_prices (product_id, price) VALUES ($1, $2) RETURNING *',
    [productPrice.product_id, productPrice.price]
  );
  return result.rows[0];
}

export async function updateProductPrice(
  id: string,
  productPrice: Partial<ProductPriceCreate>
): Promise<ProductPrice> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid product price ID format');
  }
  const updatedAt = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (productPrice.product_id !== undefined) {
    setParts.push(`product_id = $${paramCount++}`);
    values.push(productPrice.product_id);
  }
  if (productPrice.price !== undefined) {
    setParts.push(`price = $${paramCount++}`);
    values.push(productPrice.price);
  }
  setParts.push(`updated_at = $${paramCount++}`);
  values.push(updatedAt);
  values.push(id);

  const result = await pool.query(
    `UPDATE product_prices SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw new NotFoundError(`Product price not found: ${id}`);
  }
  return result.rows[0];
}

export async function deleteProductPrice(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid product price ID format');
  }
  await pool.query('DELETE FROM product_prices WHERE id = $1', [id]);
}

// User Partner functions
export async function createUserPartner(userPartner: UserPartnerCreate): Promise<UserPartner> {
  const result = await pool.query(
    'INSERT INTO user_partners (user_id, partner_id) VALUES ($1, $2) RETURNING *',
    [userPartner.user_id, userPartner.partner_id]
  );
  return result.rows[0];
}

export async function updateUserPartner(
  id: string,
  userPartner: Partial<UserPartnerCreate>
): Promise<UserPartner> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user partner ID format');
  }
  const updatedAt = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (userPartner.user_id !== undefined) {
    setParts.push(`user_id = $${paramCount++}`);
    values.push(userPartner.user_id);
  }
  if (userPartner.partner_id !== undefined) {
    setParts.push(`partner_id = $${paramCount++}`);
    values.push(userPartner.partner_id);
  }
  setParts.push(`updated_at = $${paramCount++}`);
  values.push(updatedAt);
  values.push(id);

  const result = await pool.query(
    `UPDATE user_partners SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw new NotFoundError(`User partner not found: ${id}`);
  }
  return result.rows[0];
}

export async function deleteUserPartner(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user partner ID format');
  }
  await pool.query('DELETE FROM user_partners WHERE id = $1', [id]);
}

// User Product Threshold functions
export async function createUserProductThreshold(
  threshold: UserProductThresholdCreate
): Promise<UserProductThreshold> {
  const result = await pool.query(
    'INSERT INTO user_product_thresholds (user_id, product_id, upper_threshold, lower_threshold) VALUES ($1, $2, $3, $4) RETURNING *',
    [threshold.user_id, threshold.product_id, threshold.upper_threshold, threshold.lower_threshold]
  );
  return result.rows[0];
}

export async function updateUserProductThreshold(
  id: string,
  threshold: Partial<UserProductThresholdCreate>
): Promise<UserProductThreshold> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user product threshold ID format');
  }
  const updatedAt = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (threshold.user_id !== undefined) {
    setParts.push(`user_id = $${paramCount++}`);
    values.push(threshold.user_id);
  }
  if (threshold.product_id !== undefined) {
    setParts.push(`product_id = $${paramCount++}`);
    values.push(threshold.product_id);
  }
  if (threshold.upper_threshold !== undefined) {
    setParts.push(`upper_threshold = $${paramCount++}`);
    values.push(threshold.upper_threshold);
  }
  if (threshold.lower_threshold !== undefined) {
    setParts.push(`lower_threshold = $${paramCount++}`);
    values.push(threshold.lower_threshold);
  }
  setParts.push(`updated_at = $${paramCount++}`);
  values.push(updatedAt);
  values.push(id);

  const result = await pool.query(
    `UPDATE user_product_thresholds SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw new NotFoundError(`User product threshold not found: ${id}`);
  }
  return result.rows[0];
}

export async function deleteUserProductThreshold(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user product threshold ID format');
  }
  await pool.query('DELETE FROM user_product_thresholds WHERE id = $1', [id]);
}

// User Owned Product functions
export async function createUserOwnedProduct(
  ownedProduct: UserOwnedProductCreate
): Promise<UserOwnedProduct> {
  const result = await pool.query(
    `INSERT INTO user_owned_products (user_id, product_id, quantity, purchase_price, purchase_date) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [
      ownedProduct.user_id,
      ownedProduct.product_id,
      ownedProduct.quantity || 1,
      ownedProduct.purchase_price || null,
      ownedProduct.purchase_date || new Date().toISOString(),
    ]
  );
  return result.rows[0];
}

export async function updateUserOwnedProduct(
  id: string,
  ownedProduct: UserOwnedProductUpdate
): Promise<UserOwnedProduct> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user owned product ID format');
  }
  const updatedAt = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (ownedProduct.quantity !== undefined) {
    setParts.push(`quantity = $${paramCount++}`);
    values.push(ownedProduct.quantity);
  }
  if (ownedProduct.purchase_price !== undefined) {
    setParts.push(`purchase_price = $${paramCount++}`);
    values.push(ownedProduct.purchase_price);
  }
  if (ownedProduct.purchase_date !== undefined) {
    setParts.push(`purchase_date = $${paramCount++}`);
    values.push(ownedProduct.purchase_date);
  }
  setParts.push(`updated_at = $${paramCount++}`);
  values.push(updatedAt);
  values.push(id);

  const result = await pool.query(
    `UPDATE user_owned_products SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  if (!result.rows[0]) {
    throw new NotFoundError(`User owned product not found: ${id}`);
  }
  return result.rows[0];
}

export async function deleteUserOwnedProduct(id: string): Promise<void> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user owned product ID format');
  }
  await pool.query('DELETE FROM user_owned_products WHERE id = $1', [id]);
}
