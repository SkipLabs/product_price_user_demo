export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  password_hash: string;
  [key: string]: string | number;
};

export type Post = {
  id: number;
  author_id: number;
  title: string;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type PostCreate = {
  title: string;
  content: string;
  author_id: number;
  status: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type ProductCreate = {
  name: string;
  description?: string;
};

export type ProductPrice = {
  id: number;
  product_id: number;
  price: number;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type ProductPriceCreate = {
  product_id: number;
  price: number;
};

export type UserPartner = {
  id: number;
  user_id: number;
  partner_id: number;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type UserPartnerCreate = {
  user_id: number;
  partner_id: number;
};

export type UserProductThreshold = {
  id: number;
  user_id: number;
  product_id: number;
  upper_threshold: number;
  lower_threshold: number;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type UserProductThresholdCreate = {
  user_id: number;
  product_id: number;
  upper_threshold: number;
  lower_threshold: number;
};

export type UserOwnedProduct = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type UserOwnedProductCreate = {
  user_id: number;
  product_id: number;
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
};

export type UserOwnedProductUpdate = {
  quantity?: number;
  purchase_price?: number;
  purchase_date?: string;
};
