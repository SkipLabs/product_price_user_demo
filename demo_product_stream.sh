#!/bin/bash

# ProductResource Demo Script
# This script demonstrates the real-time streaming capabilities of the new ProductResource
# Run this script to see products with prices being created, updated, and deleted in real-time

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:3000"

echo -e "${BLUE}🚀 ProductResource Real-Time Streaming Demo${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""
echo -e "${GREEN}This script will demonstrate:${NC}"
echo -e "  1. ✨ Create a product (appears in stream with price: null)"
echo -e "  2. 💰 Add a price (stream updates with price included)"
echo -e "  3. 📈 Update the price (stream shows new price)"
echo -e "  4. 📝 Update product info (stream shows updated info)"
echo -e "  5. 🗑️  Delete the product (disappears from stream)"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo -e "  1. Start streaming in another terminal: ${PURPLE}curl -LN $API_BASE/streams/products${NC}"
echo -e "  2. Run this script and press ENTER after each step to proceed"
echo -e "  3. Watch the changes appear in real-time in your stream!"
echo ""

# Check if server is running
echo -e "${BLUE}🔍 Checking if server is running...${NC}"
if ! curl -s "$API_BASE/users" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $API_BASE${NC}"
    echo -e "${YELLOW}Please start the server first:${NC}"
    echo -e "  pnpm build && pnpm start"
    exit 1
fi
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""

# Function to make API calls with pretty output (returns response)
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${PURPLE}🔄 $description${NC}"
    echo -e "${YELLOW}   → $method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        echo -e "${YELLOW}   → Data: $data${NC}"
        response=$(curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$API_BASE$endpoint")
    fi
    
    echo -e "${GREEN}   ← Response: $response${NC}"
    echo "$response"
}

# Function for silent API calls (just returns response)
make_request_silent() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X "$method" "$API_BASE$endpoint"
    fi
}

# Function to extract ID from JSON response
extract_id() {
    local json_response=$1
    echo "$json_response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2
}

# Function to wait for user input
wait_for_user() {
    local message=${1:-"Press ENTER to continue..."}
    echo -e "${YELLOW}${message}${NC}"
    read -r
}

# Give user time to set up streaming
echo -e "${YELLOW}Make sure you have the stream running in another terminal!${NC}"
echo -e "${BLUE}Tip: Run this in another terminal: ./start_stream.sh${NC}"
echo ""
wait_for_user "Press ENTER when you're ready to start the demo..."

# Step 1: Create a product
echo -e "${BLUE}📝 Step 1: Creating a new product${NC}"
echo -e "Watch your stream - a new product should appear with price: null"

# Display the request
echo -e "${PURPLE}🔄 Creating product${NC}"
echo -e "${YELLOW}   → POST /products${NC}"
echo -e "${YELLOW}   → Data: {\"name\": \"Demo Widget Pro\", \"description\": \"A premium widget for demonstration purposes\"}${NC}"

# Make the request silently and extract ID
PRODUCT_RESPONSE=$(make_request_silent "POST" "/products" \
    '{"name": "Demo Widget Pro", "description": "A premium widget for demonstration purposes"}')
echo -e "${GREEN}   ← Response: $PRODUCT_RESPONSE${NC}"

# Extract product ID
PRODUCT_ID=$(extract_id "$PRODUCT_RESPONSE")
echo -e "${GREEN}📋 Created Product ID: $PRODUCT_ID${NC}"

# Validate that we got a valid ID
if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create product or extract ID${NC}"
    exit 1
fi
echo ""
wait_for_user "✅ Check your stream for the new product, then press ENTER to continue..."

# Step 2: Add a price
echo -e "${BLUE}💰 Step 2: Adding a price to the product${NC}"
echo -e "Watch your stream - the product should now show a price!"

# Display the request
echo -e "${PURPLE}🔄 Adding price${NC}"
echo -e "${YELLOW}   → POST /product-prices${NC}"
echo -e "${YELLOW}   → Data: {\"product_id\": $PRODUCT_ID, \"price\": 29.99}${NC}"

# Make the request and extract ID
PRICE_RESPONSE=$(make_request_silent "POST" "/product-prices" \
    "{\"product_id\": $PRODUCT_ID, \"price\": 29.99}")
echo -e "${GREEN}   ← Response: $PRICE_RESPONSE${NC}"

# Extract price ID
PRICE_ID=$(extract_id "$PRICE_RESPONSE")
echo -e "${GREEN}💵 Created Price ID: $PRICE_ID${NC}"

# Validate that we got a valid price ID
if [ -z "$PRICE_ID" ] || [ "$PRICE_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create price or extract ID${NC}"
    exit 1
fi
echo ""
wait_for_user "💰 Check your stream - the product should now show price: 29.99! Press ENTER to continue..."

# Step 3: Update the price
echo -e "${BLUE}📈 Step 3: Updating the price${NC}"
echo -e "Watch your stream - the price should change to 49.99!"
echo -e "${PURPLE}🔄 Updating price to 49.99${NC}"
echo -e "${YELLOW}   → PATCH /product-prices/$PRICE_ID${NC}"
echo -e "${YELLOW}   → Data: {\"price\": 49.99}${NC}"
UPDATE_RESPONSE=$(make_request_silent "PATCH" "/product-prices/$PRICE_ID" '{"price": 49.99}')
echo -e "${GREEN}   ← Response: $UPDATE_RESPONSE${NC}"
echo ""
wait_for_user "📈 Check your stream - the price should now be 49.99! Press ENTER to continue..."

# Step 4: Update the price again
echo -e "${BLUE}💎 Step 4: Updating the price again${NC}"
echo -e "Watch your stream - the price should change to 79.99!"
echo -e "${PURPLE}🔄 Updating price to 79.99${NC}"
echo -e "${YELLOW}   → PATCH /product-prices/$PRICE_ID${NC}"
echo -e "${YELLOW}   → Data: {\"price\": 79.99}${NC}"
UPDATE_RESPONSE2=$(make_request_silent "PATCH" "/product-prices/$PRICE_ID" '{"price": 79.99}')
echo -e "${GREEN}   ← Response: $UPDATE_RESPONSE2${NC}"
echo ""
wait_for_user "💎 Check your stream - the price should now be 79.99! Press ENTER to continue..."

# Step 5: Update product information
echo -e "${BLUE}📝 Step 5: Updating product information${NC}"
echo -e "Watch your stream - the product name and description should change!"
echo -e "${PURPLE}🔄 Updating product info${NC}"
echo -e "${YELLOW}   → PATCH /products/$PRODUCT_ID${NC}"
echo -e "${YELLOW}   → Data: {\"name\": \"Demo Widget Pro Max\", \"description\": \"The ultimate premium widget with enhanced features\"}${NC}"
UPDATE_RESPONSE3=$(make_request_silent "PATCH" "/products/$PRODUCT_ID" '{"name": "Demo Widget Pro Max", "description": "The ultimate premium widget with enhanced features"}')
echo -e "${GREEN}   ← Response: $UPDATE_RESPONSE3${NC}"
echo ""
wait_for_user "📝 Check your stream - the product name should now be 'Demo Widget Pro Max'! Press ENTER to continue..."

# Step 6: Delete the product
echo -e "${BLUE}🗑️  Step 6: Deleting the product${NC}"
echo -e "Watch your stream - the product should disappear!"
echo -e "${PURPLE}🔄 Deleting product${NC}"
echo -e "${YELLOW}   → DELETE /products/$PRODUCT_ID${NC}"
DELETE_RESPONSE=$(make_request_silent "DELETE" "/products/$PRODUCT_ID")
echo -e "${GREEN}   ← Product deleted (status 204)${NC}"
echo ""
wait_for_user "🗑️  Check your stream - the product should have disappeared! Press ENTER to finish..."

echo -e "${GREEN}🎉 Demo completed!${NC}"
echo ""
echo -e "${BLUE}What you should have seen in your stream:${NC}"
echo -e "  1. ✨ Product appeared with price: null"
echo -e "  2. 💰 Product updated with price: 29.99"
echo -e "  3. 📈 Price changed to 49.99"
echo -e "  4. 💎 Price changed to 79.99"
echo -e "  5. 📝 Product name/description updated"
echo -e "  6. 🗑️  Product disappeared (deleted)"
echo ""
echo -e "${YELLOW}This demonstrates the real-time reactive capabilities of the ProductResource!${NC}"
echo -e "${GREEN}The stream automatically updates when either product info OR prices change.${NC}"