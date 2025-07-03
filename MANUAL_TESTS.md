# Manual API Tests

This file contains curl commands to manually test all the API endpoints for the new tables.

## Prerequisites

Make sure the server is running:

```bash
pnpm build && pnpm start
```

The server should be available at `http://localhost:3000`.

## 🚀 Quick Test - NEW ProductResource

Here are the key curl commands to test the new ProductResource with price information:

### 1. Start streaming products with prices

```bash
curl -LN http://localhost:3000/streams/products
```

### 2. In another terminal, test the reactive updates

```bash
# Create a product (appears in stream with price: null)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "description": "Testing prices"}'

# Add a price (stream updates with price included)
curl -X POST http://localhost:3000/product-prices \
  -H "Content-Type: application/json" \
  -d '{"product_id": 6, "price": 99.99}'
```

### 3. Test existing products with prices

```bash
# Products 1-5 already have prices from sample data
curl -LN http://localhost:3000/streams/products/1
```

## Products API

### Create a Product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Widget",
    "description": "A test widget for API testing"
  }'
```

### Update a Product

```bash
# Replace {id} with the actual product ID from the create response
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Widget",
    "description": "An updated test widget"
  }'
```

### Delete a Product

```bash
# Replace {id} with the actual product ID
curl -X DELETE http://localhost:3000/products/{id}
```

## Product Prices API

### Create a Product Price

```bash
# Replace product_id with an existing product ID
curl -X POST http://localhost:3000/product-prices \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "price": 29.99
  }'
```

### Update a Product Price

```bash
# Replace {id} with the actual product price ID from the create response
curl -X PATCH http://localhost:3000/product-prices/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 39.99
  }'
```

### Delete a Product Price

```bash
# Replace {id} with the actual product price ID
curl -X DELETE http://localhost:3000/product-prices/{id}
```

## User Partners API

### Create a User Partner Relationship

```bash
# Replace user_id and partner_id with existing user IDs
curl -X POST http://localhost:3000/user-partners \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "partner_id": 2
  }'
```

### Update a User Partner Relationship

```bash
# Replace {id} with the actual user partner ID from the create response
curl -X PATCH http://localhost:3000/user-partners/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": 3
  }'
```

### Delete a User Partner Relationship

```bash
# Replace {id} with the actual user partner ID
curl -X DELETE http://localhost:3000/user-partners/{id}
```

## User Product Thresholds API

### Create a User Product Threshold

```bash
# Replace user_id and product_id with existing IDs
curl -X POST http://localhost:3000/user-product-thresholds \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "product_id": 1,
    "upper_threshold": 100.00,
    "lower_threshold": 10.00
  }'
```

### Update a User Product Threshold

```bash
# Replace {id} with the actual threshold ID from the create response
curl -X PATCH http://localhost:3000/user-product-thresholds/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "upper_threshold": 150.00,
    "lower_threshold": 15.00
  }'
```

### Delete a User Product Threshold

```bash
# Replace {id} with the actual threshold ID
curl -X DELETE http://localhost:3000/user-product-thresholds/{id}
```

## Test Sequence Example

Here's a complete test sequence you can run:

```bash
# 1. Create a product
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "description": "A test product"}')
echo "Created product: $PRODUCT_RESPONSE"

# Extract product ID (requires jq)
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
echo "Product ID: $PRODUCT_ID"

# 2. Create a product price
PRICE_RESPONSE=$(curl -s -X POST http://localhost:3000/product-prices \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": $PRODUCT_ID, \"price\": 25.99}")
echo "Created product price: $PRICE_RESPONSE"

# 3. Create a user partner relationship (using existing users from sample data)
PARTNER_RESPONSE=$(curl -s -X POST http://localhost:3000/user-partners \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "partner_id": 2}')
echo "Created user partner: $PARTNER_RESPONSE"

# 4. Create a user product threshold
THRESHOLD_RESPONSE=$(curl -s -X POST http://localhost:3000/user-product-thresholds \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": 1, \"product_id\": $PRODUCT_ID, \"upper_threshold\": 50.00, \"lower_threshold\": 5.00}")
echo "Created threshold: $THRESHOLD_RESPONSE"
```

## Streaming Endpoints

### Stream All Users

```bash
# Follow redirects and stream continuously
curl -LN http://localhost:3000/streams/users

# Alternative: Get the redirect URL first, then stream
USERS_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/users)
curl -N $USERS_STREAM_URL
```

### Stream Users by UID

```bash
# Replace {uid} with a specific user ID (e.g., 1)
curl -LN http://localhost:3000/streams/users/1

# Alternative: Get the redirect URL first, then stream
USERS_UID_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/users/1)
curl -N $USERS_UID_STREAM_URL
```

### Stream All Products with Prices (NEW ProductResource)

```bash
# Follow redirects and stream continuously
curl -LN http://localhost:3000/streams/products

# Alternative: Get the redirect URL first, then stream
PRODUCTS_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/products)
curl -N $PRODUCTS_STREAM_URL
```

### Stream Products with Prices by UID (NEW ProductResource)

```bash
# Replace {uid} with a specific product ID (e.g., 1)
curl -LN http://localhost:3000/streams/products/1

# Alternative: Get the redirect URL first, then stream
PRODUCTS_UID_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/products/1)
curl -N $PRODUCTS_UID_STREAM_URL
```

### Stream All Posts (existing)

```bash
# Follow redirects and stream continuously
curl -LN http://localhost:3000/streams/posts

# Alternative: Get the redirect URL first, then stream
POSTS_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/posts)
curl -N $POSTS_STREAM_URL
```

### Stream Posts by UID (existing)

```bash
# Replace {uid} with a specific post ID (e.g., 1)
curl -LN http://localhost:3000/streams/posts/1

# Alternative: Get the redirect URL first, then stream
POSTS_UID_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/posts/1)
curl -N $POSTS_UID_STREAM_URL
```

### Stream Users with Product Sum

```bash
# Stream users with their total product value
curl -LN http://localhost:3000/streams/usersWithProductSum

# Alternative: Get the redirect URL first, then stream
USERS_PRODUCT_SUM_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/usersWithProductSum)
curl -N $USERS_PRODUCT_SUM_STREAM_URL
```

### Stream Users with Product Sum by UID

```bash
# Replace {uid} with a specific user ID (e.g., 1)
curl -LN http://localhost:3000/streams/usersWithProductSum/1

# Alternative: Get the redirect URL first, then stream
USERS_PRODUCT_SUM_UID_STREAM_URL=$(curl -s -o /dev/null -w "%{redirect_url}" http://localhost:3000/streams/usersWithProductSum/1)
curl -N $USERS_PRODUCT_SUM_UID_STREAM_URL
```

### NEW: ProductResource Streaming Test Sequence

```bash
# Test the new ProductResource that includes price information

# Terminal 1: Start streaming all products with prices
curl -LN http://localhost:3000/streams/products

# Terminal 2: Create a new product (should appear in stream WITHOUT price initially)
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Stream Test Product", "description": "Testing real-time streams"}')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
echo "Created Product ID: $PRODUCT_ID"

# Terminal 2: Add a price to the product (should update in stream WITH price)
curl -X POST http://localhost:3000/product-prices \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": $PRODUCT_ID, \"price\": 45.99}"

# Terminal 2: Update the price (should reflect in stream)
curl -X PATCH http://localhost:3000/product-prices/$(curl -s http://localhost:3000/product-prices | jq -r ".[] | select(.product_id == $PRODUCT_ID) | .id") \
  -H "Content-Type: application/json" \
  -d '{"price": 59.99}'

# Terminal 2: Update the product name (should reflect in stream)
curl -X PATCH http://localhost:3000/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Stream Test Product with Price"}'
```

### Original Products Streaming Test Sequence

```bash
# Test streaming while making changes to see real-time updates

# Terminal 1: Start streaming all products
curl -LN http://localhost:3000/streams/products

# Terminal 2: Create a new product (you should see this appear in Terminal 1)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Stream Test Product", "description": "Testing real-time streams"}'

# Terminal 2: Update the product (you should see this change in Terminal 1)
curl -X PATCH http://localhost:3000/products/6 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Stream Test Product"}'

# Terminal 2: Delete the product (you should see this removal in Terminal 1)
curl -X DELETE http://localhost:3000/products/6
```

### Test Users with Product Sum Stream

```bash
# Terminal 1: Start streaming users with product sum
curl -LN http://localhost:3000/streams/usersWithProductSum

# Terminal 2: Create a product price to test reactive updates
curl -X POST http://localhost:3000/product-prices \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "price": 99.99}'

# Terminal 2: Create a user product threshold (should trigger sum recalculation)
curl -X POST http://localhost:3000/user-product-thresholds \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "product_id": 1, "upper_threshold": 200.00, "lower_threshold": 20.00}'

# You should see the total_product_value field update in the stream
```

## Expected Responses

### Successful Creation (201 Created)

All POST requests should return the created object with generated `id`, `created_at`, and `updated_at` fields.

### Successful Update (200 OK)

All PATCH requests should return the updated object with modified `updated_at` field.

### Successful Deletion (204 No Content)

All DELETE requests should return an empty response with status 204.

### Streaming Responses (301 Redirect)

All streaming endpoints return a 301 redirect to the Skip streaming service URL where you can access real-time data streams.

#### ProductResource Stream Response Format (NEW)

The `products` stream now returns products with price information:

```json
{
  "id": 1,
  "name": "SuperWidget",
  "description": "The ultimate widget for all your widget needs.",
  "price": 19.99,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Key Features:**

- `price`: Current price from product_prices table (null if no price set)
- Real-time updates when either product info OR price changes
- Reactive mapping joins products with their prices automatically

#### Users with Product Sum Stream Response Format

The `usersWithProductSum` stream returns users with an additional `total_product_value` field:

```json
{
  "id": 1,
  "username": "ada_lovelace",
  "email": "countess@analytical-engine.dev",
  "created_at": "2023-01-01T00:00:00Z",
  "total_product_value": 0
}
```

Note: The `total_product_value` field represents the sum of prices for all products that the user has thresholds configured for.

### Error Responses

- `400 Bad Request`: Invalid request body or missing required fields
- `404 Not Found`: Resource not found (for updates/deletes)
- `500 Internal Server Error`: Database or server errors
