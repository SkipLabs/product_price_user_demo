#!/bin/bash

# Simple script to start the product stream
# Run this in one terminal, then run demo_product_stream.sh in another

echo "🌊 Starting ProductResource stream..."
echo "You should see existing products with their prices first,"
echo "then watch for real-time updates as the demo script runs."
echo ""
echo "Press Ctrl+C to stop streaming"
echo "================================================"

curl -LN http://localhost:3000/streams/products