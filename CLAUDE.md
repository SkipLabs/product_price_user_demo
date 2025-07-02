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

### Setup
- `./init_server.sh` - Complete development setup (PostgreSQL container, schema, dependencies)

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
PostgreSQL database with users, posts, tags, and post_tags tables. Connection details:
- Host: localhost:5432, Database: skipdb, User: skipper, Password: skipper123

### API Endpoints
- User management: `/users`, `/users/:id`
- Post management: `/posts/:id`, `/posts` (CRUD operations)
- Real-time streams: `/streams/posts`, `/streams/posts/:uid`

## Key Patterns

### Error Handling
Custom error classes in `src/errors.ts` with proper HTTP status codes. Always use these for consistent API responses.

### Type Definitions
All data models defined in `src/db/models.ts`. Use these types throughout the application for consistency.

### Reactive Data Flow
Posts are streamed with author information automatically mapped from users table. The Skip service handles real-time updates when database changes occur.

## Development Notes

### Missing Infrastructure
- No testing framework configured - tests need to be set up from scratch
- No linting configuration despite ESLint dependencies
- Client code referenced in package.json but not present

### TypeScript Configuration
- ES2022 target with NodeNext modules (ESM)
- Strict type checking enabled
- Output to `./dist` directory

### Database Development
Schema and sample data in `src/db/schema.sql`. Use this as reference for data structure and relationships.