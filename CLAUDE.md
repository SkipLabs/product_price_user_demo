# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Skip-powered blog/content management service built with TypeScript, Fastify, and PostgreSQL. Skip is a reactive data streaming framework that enables real-time data processing and streaming.

## Essential Commands

### Development

- `pnpm install` - Install dependencies
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Run the compiled application
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Remove dist and node_modules directories
- `pnpm client` - Run example client (if available)

### Setup

- `./init_server.sh` - Complete development setup (PostgreSQL container, schema, dependencies)

### Cleanup

- `pnpm clean` - Remove dist and node_modules directories
- `docker stop skip-demo-postgres && docker rm skip-demo-postgres` - Remove PostgreSQL container

## Architecture

### Core Components

- **REST API**: Fastify web server on port 3000 (`src/index.ts`)
- **Skip Service**: Reactive data streaming service (`src/skipservice.ts`)
- **Database Layer**: PostgreSQL operations (`src/db/`)

### Skip Service Configuration

- Streaming port: 8080 (real-time data streams)
- Control port: 8081 (service management)
- Uses PostgreSQL adapter for reactive data access

### Database Schema

PostgreSQL database with users, posts, tags, post_tags, products, product_prices, user_partners, and user_product_thresholds tables. Connection details:

- Host: localhost:5432, Database: skipdb, User: skipper, Password: skipper123

### API Endpoints

- **User management**: `/users`, `/users/:id`
- **Post management**: `/posts/:id`, `/posts` (CRUD operations), `/posts/:id/publish`, `/posts/:id/unpublish`
- **Product management**: `/products`, `/product-prices`, `/user-partners`, `/user-product-thresholds`, `/user-owned-products` (CRUD operations)
- **Real-time streams**:
  - Posts: `/streams/posts`, `/streams/posts/:uid`
  - Products with prices: `/streams/products`, `/streams/products/:uid`
  - Product prices: `/streams/prices`, `/streams/prices/:uid`
  - Users: `/streams/users`, `/streams/users/:uid`
  - User-owned products: `/streams/user-owned-products`, `/streams/user-owned-products/:uid`
  - Users with product sum: `/streams/usersWithProductSum`, `/streams/usersWithProductSum/:uid`

## Key Patterns

### Error Handling

Custom error classes in `src/errors.ts` with proper HTTP status codes. Always use these for consistent API responses.

### Type Definitions

All data models defined in `src/db/models.ts`. Use these types throughout the application for consistency.

### Reactive Data Flow

- **Posts**: Streamed with author information automatically mapped from users table via `PostsMapper`
- **Products**: Streamed with price information joined from product_prices table via `ProductPriceMapper`
- **Product prices**: Streamed directly from product_prices table via `PricesMapper`
- **Users**: Streamed directly from users table via `UsersMapper`
- **User-owned products**: Streamed with enriched user and product details via `UserOwnedProductsMapper`
- **User-Product relationships**: Managed through user_product_thresholds for ownership/monitoring

The Skip service handles real-time updates when database changes occur, automatically propagating changes through the reactive computation graph. Mappers in `src/mappers/` handle the transformation between raw database records and streamed resources.

## Development Notes

### Missing Infrastructure

- No testing framework configured - tests need to be set up from scratch
- No linting configuration despite ESLint dependencies
- Client code referenced in package.json but not present
- Database operations assume Skip PostgreSQL adapter patterns

### TypeScript Configuration

- ES2022 target with NodeNext modules (ESM)
- Strict type checking enabled
- Output to `./dist` directory

### Database Development

Schema and sample data in `src/db/schema.sql`. Use this as reference for data structure and relationships.

### Environment Variables

- `SKIP_READ_URL` - Skip service streaming endpoint URL (defaults to `http://localhost:8080`)
