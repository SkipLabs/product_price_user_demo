#!/bin/bash

# Skip Full Power Demo Script
# This script demonstrates the complete real-time streaming capabilities of the Skip-powered service
# Shows interconnected updates across users, posts, products, and user-owned products

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:3000"

echo -e "${BLUE}🚀 Skip Full Power Real-Time Streaming Demo${NC}"
echo -e "${YELLOW}===============================================${NC}"
echo ""
echo -e "${GREEN}This script demonstrates the complete Skip reactive system:${NC}"
echo -e "  💰 Products with prices"  
echo -e "  💵 Product prices (dedicated stream)"
echo -e "  👥 Users"
echo -e "  🛒 User-owned products with enriched data"
echo -e "  🔄 Real-time cross-resource updates"
echo ""
echo -e "${CYAN}🌊 STREAMING SETUP INSTRUCTIONS:${NC}"
echo -e "${YELLOW}Open these streams in separate terminals before starting:${NC}"
echo ""
echo -e "${PURPLE}Terminal 1 - Products Stream:${NC}"
echo -e "  curl -LN $API_BASE/streams/products"
echo ""
echo -e "${PURPLE}Terminal 2 - Prices Stream:${NC}"
echo -e "  curl -LN $API_BASE/streams/prices"
echo ""
echo -e "${PURPLE}Terminal 3 - Users Stream:${NC}"
echo -e "  curl -LN $API_BASE/streams/users"
echo ""
echo -e "${PURPLE}Terminal 4 - User-Owned Products Stream:${NC}"
echo -e "  curl -LN $API_BASE/streams/user-owned-products"
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

# Function to make API calls with pretty output
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

# Function for silent API calls
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

# Function to add a dramatic pause
dramatic_pause() {
    local seconds=${1:-2}
    echo -e "${CYAN}⏳ Processing... (${seconds}s)${NC}"
    sleep "$seconds"
}

# Give user time to set up streaming
echo -e "${YELLOW}📺 Make sure you have ALL 4 streams running in separate terminals!${NC}"
echo ""
wait_for_user "Press ENTER when all streams are ready..."

echo -e "${BLUE}🎬 Starting the Skip Full Power Demo!${NC}"
echo ""

# ============================================================================
# PHASE 1: Create foundational data
# ============================================================================

echo -e "${CYAN}========== PHASE 1: Setting the Stage ==========${NC}"
echo ""

# Step 1: Get an existing user for the demo
echo -e "${BLUE}👤 Step 1: Using existing user (Ada Lovelace)${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the users stream, you should see all existing users listed${NC}"
echo -e "${YELLOW}   Look for users like ada_lovelace, alan_turing, grace_hopper, etc.${NC}"
echo ""
wait_for_user "👀 Ready to check users stream? Press ENTER..."

# Get the first user (Ada Lovelace) for our demo
USER_RESPONSE=$(make_request_silent "GET" "/users")
echo -e "${GREEN}✅ Retrieved users: ${USER_RESPONSE:0:100}...${NC}"

# Extract first user ID (Ada Lovelace is ID 1)
USER_ID=1
echo -e "${GREEN}📋 Using User ID: $USER_ID (Ada Lovelace)${NC}"
echo ""

# Step 2: Create a product
echo -e "${BLUE}📦 Step 2: Creating a new product${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the products stream, a new product should appear${NC}"
echo -e "${YELLOW}   Look for: name='Demo Gadget 3000', price=null${NC}"
echo ""
wait_for_user "👀 Ready to create product? Press ENTER..."

PRODUCT_RESPONSE=$(make_request_silent "POST" "/products" \
    '{"name": "Demo Gadget 3000", "description": "The ultimate demonstration gadget"}')
echo -e "${GREEN}✅ Created product: $PRODUCT_RESPONSE${NC}"

PRODUCT_ID=$(extract_id "$PRODUCT_RESPONSE")
echo -e "${GREEN}📋 Product ID: $PRODUCT_ID${NC}"
echo ""

# Step 3: Add price to product
echo -e "${BLUE}💰 Step 3: Adding price to the product${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: Changes in TWO streams:${NC}"
echo -e "${YELLOW}   • Products stream: The Demo Gadget 3000 price should change from null → 199.99${NC}"
echo -e "${YELLOW}   • Prices stream: A new price record should appear with product_id and price=199.99${NC}"
echo ""
wait_for_user "👀 Ready to add price? Press ENTER..."

PRICE_RESPONSE=$(make_request_silent "POST" "/product-prices" \
    "{\"product_id\": $PRODUCT_ID, \"price\": 199.99}")
echo -e "${GREEN}✅ Created price: $PRICE_RESPONSE${NC}"

PRICE_ID=$(extract_id "$PRICE_RESPONSE")
echo -e "${GREEN}💵 Price ID: $PRICE_ID${NC}"
echo ""

# ============================================================================
# PHASE 2: Show interconnected updates
# ============================================================================

echo -e "${CYAN}========== PHASE 2: The Magic of Skip - Interconnected Updates ==========${NC}"
echo ""

# Step 4: User buys the product
echo -e "${BLUE}🛒 Step 4: User purchases the product${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the user-owned products stream, a new ownership record should appear${NC}"
echo -e "${YELLOW}   Look for: Ada Lovelace owning Demo Gadget 3000, quantity=2, enriched with:${NC}"
echo -e "${YELLOW}   • User info: username='ada_lovelace', email='countess@analytical-engine.dev'${NC}"
echo -e "${YELLOW}   • Product info: name='Demo Gadget 3000'${NC}"
echo -e "${YELLOW}   • Prices: purchase_price=199.99, current_price=199.99${NC}"
echo ""
wait_for_user "👀 Ready to create ownership? Press ENTER..."

OWNERSHIP_RESPONSE=$(make_request_silent "POST" "/user-owned-products" \
    "{\"user_id\": $USER_ID, \"product_id\": $PRODUCT_ID, \"quantity\": 2, \"purchase_price\": 199.99}")
echo -e "${GREEN}✅ Created ownership: $OWNERSHIP_RESPONSE${NC}"

OWNERSHIP_ID=$(extract_id "$OWNERSHIP_RESPONSE")
echo -e "${GREEN}🏷️  Ownership ID: $OWNERSHIP_ID${NC}"
echo ""

# Step 5: Show the user ownership data
echo -e "${BLUE}📊 Step 5: Review the user's new ownership${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: The user-owned products stream should now show:${NC}"
echo -e "${YELLOW}   • The new ownership record we just created${NC}"
echo -e "${YELLOW}   • Plus any existing ownership records from the sample data${NC}"
echo -e "${YELLOW}   • Notice how each record includes full user details, product details, and pricing${NC}"
echo -e "${YELLOW}   • This demonstrates Skip's automatic data enrichment across tables${NC}"
echo ""
wait_for_user "👀 Ready to review ownership data? Press ENTER..."

echo -e "${GREEN}✅ This shows Skip's data enrichment capabilities!${NC}"
echo ""

# ============================================================================
# PHASE 3: Demonstrate reactive updates
# ============================================================================

echo -e "${CYAN}========== PHASE 3: Reactive Magic - Watch Everything Update! ==========${NC}"
echo ""

# Step 6: Price increase!
echo -e "${BLUE}📈 Step 6: Product price increases (market forces!)${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: Changes in THREE streams simultaneously:${NC}"
echo -e "${YELLOW}   • Products stream: Demo Gadget 3000 price changes from 199.99 → 249.99${NC}"
echo -e "${YELLOW}   • Prices stream: The price record updates to show price=249.99${NC}"
echo -e "${YELLOW}   • User-owned products stream: current_price updates to 249.99 BUT purchase_price stays 199.99${NC}"
echo -e "${YELLOW}   This shows reactive updates propagating across the entire data graph!${NC}"
echo ""
wait_for_user "👀 Ready to increase price? Press ENTER..."

dramatic_pause 1

make_request_silent "PATCH" "/product-prices/$PRICE_ID" '{"price": 249.99}'
echo -e "${GREEN}✅ Price updated to 249.99!${NC}"
echo ""

# Step 7: User buys more quantity
echo -e "${BLUE}🛒 Step 7: User loves the product and buys more!${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the user-owned products stream:${NC}"
echo -e "${YELLOW}   • Ada's ownership record for Demo Gadget 3000 should update${NC}"
echo -e "${YELLOW}   • Quantity should change from 2 → 5${NC}"
echo -e "${YELLOW}   • All other fields remain the same (user info, product info, prices)${NC}"
echo ""
wait_for_user "👀 Ready to update quantity? Press ENTER..."

make_request_silent "PUT" "/user-owned-products/$OWNERSHIP_ID" '{"quantity": 5}'
echo -e "${GREEN}✅ Quantity updated to 5!${NC}"
echo ""

# Step 8: Show existing user-owned products
echo -e "${BLUE}📊 Step 8: Check existing user ownership data${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the user-owned products stream, you should see:${NC}"
echo -e "${YELLOW}   • Multiple ownership records from different users${NC}"
echo -e "${YELLOW}   • Each record showing enriched data with user info, product info, and pricing${NC}"
echo -e "${YELLOW}   • Notice how some users bought the same products at different prices${NC}"
echo -e "${YELLOW}   • Compare purchase_price vs current_price to see gains/losses${NC}"
echo ""
wait_for_user "👀 Ready to review all ownership data? Press ENTER..."

echo -e "${GREEN}✅ The stream shows enriched data with cross-referenced information!${NC}"
echo ""

# Step 9: Product description update
echo -e "${BLUE}📝 Step 9: Product gets an updated description${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: Changes in TWO streams:${NC}"
echo -e "${YELLOW}   • Products stream: Demo Gadget 3000 description should change${NC}"
echo -e "${YELLOW}   • User-owned products stream: All ownership records with this product${NC}"
echo -e "${YELLOW}     should automatically show the new description${NC}"
echo -e "${YELLOW}   This demonstrates reactive cross-table updates!${NC}"
echo ""
wait_for_user "👀 Ready to update product description? Press ENTER..."

make_request_silent "PATCH" "/products/$PRODUCT_ID" \
    '{"description": "The ultimate demonstration gadget - NOW WITH 50% MORE AWESOME!"}'
echo -e "${GREEN}✅ Product description updated!${NC}"
echo ""

# ============================================================================
# PHASE 4: Clean up with cascading deletes
# ============================================================================

echo -e "${CYAN}========== PHASE 4: Cleanup - Watch the Cascade ==========${NC}"
echo ""

# Step 10: Delete the ownership
echo -e "${BLUE}💔 Step 10: User sells their gadgets${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: In the user-owned products stream:${NC}"
echo -e "${YELLOW}   • Ada's ownership record for Demo Gadget 3000 should disappear${NC}"
echo -e "${YELLOW}   • All other ownership records should remain unchanged${NC}"
echo -e "${YELLOW}   • This shows targeted record deletion in real-time${NC}"
echo ""
wait_for_user "👀 Ready to delete ownership? Press ENTER..."

make_request_silent "DELETE" "/user-owned-products/$OWNERSHIP_ID"
echo -e "${GREEN}✅ Ownership deleted!${NC}"
echo ""

# Step 11: Delete the product
echo -e "${BLUE}🗑️ Step 11: Product discontinued${NC}"
echo ""
echo -e "${YELLOW}🔍 WATCH FOR: Changes in TWO streams:${NC}"
echo -e "${YELLOW}   • Products stream: Demo Gadget 3000 should disappear${NC}"
echo -e "${YELLOW}   • Prices stream: The corresponding price record should also disappear${NC}"
echo -e "${YELLOW}   This demonstrates cascading deletes (product deletion removes related prices)${NC}"
echo ""
wait_for_user "👀 Ready to delete product? Press ENTER..."

make_request_silent "DELETE" "/products/$PRODUCT_ID"
echo -e "${GREEN}✅ Product deleted!${NC}"
echo ""


# ============================================================================
# FINALE
# ============================================================================

echo -e "${GREEN}🎉 Skip Full Power Demo Complete!${NC}"
echo ""
echo -e "${CYAN}========== What You Just Witnessed ==========${NC}"
echo -e "${GREEN}✨ Real-time reactive data streaming with Skip:${NC}"
echo ""
echo -e "${YELLOW}📊 Multiple interconnected streams:${NC}"
echo -e "  • Products with current prices"
echo -e "  • Product prices (dedicated view)"
echo -e "  • Users"
echo -e "  • User-owned products with enriched data"
echo ""
echo -e "${YELLOW}🔄 Automatic cross-resource updates:${NC}"
echo -e "  • Price changes updated products, prices, AND user-owned-products streams"
echo -e "  • Product info changes propagated to user-owned-products"
echo -e "  • User info propagates to user-owned-products"
echo -e "  • Dedicated prices stream shows pure price data and updates"
echo ""
echo -e "${YELLOW}⚡ Real-time reactivity:${NC}"
echo -e "  • No polling needed - changes appear instantly"
echo -e "  • Skip automatically manages data relationships"
echo -e "  • Consistent data across all streams"
echo ""
echo -e "${YELLOW}🏗️ Rich data enrichment:${NC}"
echo -e "  • Products include current pricing"
echo -e "  • User-owned products include user, product, AND price data"
echo ""
echo -e "${YELLOW}💡 Key insight - Compare purchase_price vs current_price:${NC}"
echo -e "  • Users can see their investment gains/losses in real-time"
echo -e "  • Purchase price stays historical, current price updates live"
echo -e "  • Perfect for portfolio tracking, inventory management, etc."
echo ""
echo -e "${BLUE}This is the power of Skip - reactive, real-time, relational data streaming!${NC}"
echo -e "${GREEN}Perfect for building responsive, live-updating applications.${NC}"