# Skip Real-Time Streaming Demo

Real-time reactive data streaming demo with Skip - showcasing cross-resource updates and automatic data enrichment

## 🚀 What This Demo Shows

This project demonstrates Skip's powerful reactive data streaming capabilities through a live, interactive demo featuring:

- **Real-time data streaming** across multiple interconnected resources
- **Automatic data enrichment** with cross-table joins and relationships
- **Reactive updates** that propagate instantly across the entire data graph
- **Investment tracking** with historical vs. current pricing
- **Multi-stream coordination** showing the same data from different perspectives

## 🌊 Four Live Data Streams

The demo provides four real-time streams that update automatically when data changes:

1. **Products Stream** - Products with current pricing (enriched view)
2. **Prices Stream** - Raw price data (focused view)
3. **Users Stream** - User information 
4. **User-Owned Products Stream** - Ownership data enriched with user, product, and pricing details

## 🎬 Interactive Demo

Run the comprehensive demo that shows:

- Creating products and adding prices
- Users purchasing products with automatic data enrichment
- Price changes propagating across multiple streams simultaneously
- Real-time investment tracking (purchase price vs. current price)
- Cross-resource updates and cascading deletes

```bash
# Quick start - run everything
./init_server.sh      # Setup database and build
./demo_skip_full.sh    # Run the interactive demo
```

## ⚡ Key Features Demonstrated

### Real-Time Reactivity
- No polling required - changes appear instantly
- Skip automatically manages data relationships
- Consistent data across all streams

### Data Enrichment
- Products include current pricing
- User-owned products automatically include user details, product info, AND current pricing
- Cross-table joins happen automatically

### Cross-Resource Updates
- Price changes update products, prices, AND user-owned-products streams
- Product info changes propagate to user-owned-products
- User info updates propagate to related records

### Investment Tracking
- Compare purchase price vs current price in real-time
- Perfect for portfolio tracking and financial applications
- Historical data preservation with live market updates

## 🏗️ Architecture

Built with modern technologies:

- **Skip** - Reactive data streaming framework
- **TypeScript** - Type-safe development
- **Fastify** - High-performance web framework
- **PostgreSQL** - Relational database with sample data
- **Docker** - Containerized database setup

### Database Schema
- `users` - User accounts with sample data (Ada Lovelace, Alan Turing, etc.)
- `products` - Product catalog
- `product_prices` - Current pricing data
- `user_owned_products` - User ownership with purchase history
- Rich sample data for immediate demonstration

## 🛠️ Development

### Prerequisites
- Node.js (Latest LTS version)
- pnpm package manager
- Docker (for PostgreSQL)

### Quick Start
```bash
# Complete setup
./init_server.sh

# Or manual setup
pnpm install
pnpm build
pnpm start

# Clean everything
./clean_all.sh
```

### Available Scripts
- `./init_server.sh` - Complete setup (database + build)
- `./demo_skip_full.sh` - Run interactive demo
- `./clean_all.sh` - Complete cleanup (Docker + files)
- `pnpm build` - Build TypeScript
- `pnpm start` - Start the server
- `pnpm format` - Format code

## 📡 API Endpoints

### Core Resources
- **Products**: `/products` (CRUD)
- **Prices**: `/product-prices` (CRUD)
- **Users**: `/users` (GET only)
- **User-Owned Products**: `/user-owned-products` (CRUD)

### Real-Time Streams
- **Products**: `/streams/products`
- **Prices**: `/streams/prices`
- **Users**: `/streams/users` 
- **User-Owned Products**: `/streams/user-owned-products`

All streams support filtering by ID: `/streams/{resource}/:uid`

## 🎯 Perfect For Demonstrating

- **Financial Applications** - Portfolio tracking, investment monitoring
- **E-commerce Platforms** - Inventory with pricing, user purchases
- **IoT Dashboards** - Sensor data with metadata enrichment
- **Real-time Analytics** - Live data aggregation and correlation
- **Any application** requiring live, enriched data views

## 🎪 Demo Presentation

Use `DEMO_SCRIPT.md` for guided presentation talking points.

**Typical demo flow (~5-7 minutes):**
1. Show existing data streams
2. Create product → watch streams update
3. Add pricing → see cross-stream updates
4. User purchase → demonstrate data enrichment
5. Price increase → show reactive propagation
6. Product updates → cross-resource synchronization

## 🔗 Learn More

- [Skip Documentation](https://skiplabs.io/docs/)
- [Skip GitHub Repository](https://github.com/skiplabs/skip)
- [Create Skip Service](https://github.com/SkipLabs/create-skip-service)

## 📄 License

ISC License

---

**Ready to see reactive data streaming in action?** Run `./demo_skip_full.sh` and watch the magic happen! ✨