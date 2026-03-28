# AGENTS.md

## Project Overview

Monorepo personal website with two workspaces:

- **`client/`** — Vite + React (JSX), Zustand state management, Framer Motion animations, react-router-dom
- **`server/`** — Fastify + TypeScript, Mongoose (MongoDB), JWT auth, Vitest

No pre-commit hooks or CI workflows configured.

### Directory Structure

- `client/` — Vite + React frontend (`src/api/`, `assets/`, `components/`, `data/`, `hooks/`, `pages/`, `store/`, `styles/`, `test/`)
- `server/` — Fastify + TypeScript backend (`src/config/`, `models/`, `routes/`, `middleware/`, `utils/`, `scripts/`)
- `docker-compose.yml`, `mongodb-data/` (Docker volume)

### Environment Setup

Create `.env` files with required variables:

- **`server/.env`**:
  ```bash
  MONGO_URI=mongodb://localhost:27017/mbri-website
  JWT_SECRET=your-super-secret-jwt-key-change-this
  PORT=3000
  NODE_ENV=development
  ```

- **`client/.env`** (optional):
  ```bash
  VITE_API_URL=http://localhost:3000/api
  ```

### Dev Server Ports

- Client: `5173` (Vite default) — http://localhost:5173
- Server: `3000` — http://localhost:3000
- MongoDB: `27017` (via Docker)

## Build / Dev Commands

All commands run from their respective directory (`client/` or `server/`).

### Client (`client/`)

```bash
npm run dev           # Start Vite dev server
npm run build         # Production build (vite build) → dist/
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run lint -- --fix # Auto-fix ESLint issues
npm run test          # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
```

### Server (`server/`)

```bash
npm run dev           # Start dev server with tsx watch
npm run build         # Compile TypeScript (tsc) → dist/
npm run start         # Run compiled output (node dist/index.js)
npm run seed          # Seed database (tsx src/scripts/seed.ts)
npm run test          # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
```

### Testing

- **Test runner**: Vitest (both client and server)
- **Client tests**: `*.test.{js,jsx}` in `src/` — uses `@testing-library/react`, `jsdom` environment
  - Setup file: `src/test/setup.js` (imports `@testing-library/jest-dom`)
- **Server tests**: `*.test.ts` in `src/` — `mongodb-memory-server` for isolated DB tests
- **Run single test**:
  ```bash
  # Client (from client/)
  npm run test -- src/components/Loading.test.jsx
  npx vitest run src/components/Loading.test.jsx
  npm run test:watch -- src/components/Loading.test.jsx
  
  # Server (from server/)
  npm run test -- src/routes/articles.test.ts
  npx vitest run src/routes/articles.test.ts
  npm run test:watch -- src/routes/articles.test.ts
  ```

### Linting

- **Client**: `npm run lint` (runs `npx eslint .` via `eslint.config.js`)
  - ESLint config includes `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` (allows uppercase variables like `VITE_API_URL`)
  - Uses ESLint flat config with React hooks and refresh plugins
  - Auto-fix: `npm run lint -- --fix`
- **Server**: no separate linter; rely on `tsc` strict mode (`npm run build`)
  - TypeScript `strict: true` enables all strict type checking
  - Build also serves as type check and linting

## Code Style

### General

- Write **concise, functional code** — avoid unnecessary abstractions
- Comments welcome; use JSDoc header format: `/** @file src/components/Foo.jsx @brief Description @author MBri @date YYYY-MM-DD */`
- Constants: `UPPER_SNAKE_CASE` for environment variables, `camelCase` for others
- Use English for code, Chinese for comments/documentation

### Client (JSX)

- Files use `.jsx` extension (no TypeScript)
- Components: `PascalCase.jsx` (e.g., `NavBar.jsx`, `ArticleDetail.jsx`)
- Hooks: `useCamelCase.js` (e.g., `useTypewriter.js`)
- Pages: `PascalCase.jsx` in `src/pages/`
- Store: single Zustand store in `src/store/useStore.js`
- API layer: centralized in `src/api/index.js` using Axios with interceptors

### Server (TypeScript)

- Files use `.ts` extension
- ESM imports must include `.js` extension: `import { Article } from '../models/Article.js'`
- Models: define Mongoose `interface` with `I` prefix + `PascalCase`, export typed model
- Routes: export async function taking `FastifyInstance`
- TypeScript strict mode enabled (`tsconfig.json`)

### Imports Order

```jsx
// Client — React, third-party, then local (alphabetical within groups)
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import '../styles/components/nav.css';
```

```ts
// Server — third-party, then local (always .js extension)
import Fastify from 'fastify';
import { Article } from '../models/Article.js';
import { connectDatabase } from './config/database.js';
```

### Naming Conventions

| Scope | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase | `NavBar.jsx` |
| React hooks | useCamelCase | `useTypewriter.js` |
| Pages | PascalCase | `Home.jsx` |
| Zustand actions | camelCase verbs | `toggleTheme` |
| TS interfaces | I-prefix | `IArticle` |
| TS models | PascalCase | `Article`, `Project` |
| API endpoints | `/api/resource` | `/api/articles/:slug` |
| Test files | `*.test.{js,jsx}` / `*.test.ts` | `Loading.test.jsx` |
| Environment vars | UPPER_SNAKE_CASE | `VITE_API_URL` |

### Error Handling

- **Client API layer**: Axios interceptors handle responses; callers handle errors via try/catch
  ```jsx
  try {
    const data = await articleAPI.getAll();
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    // Show user-friendly error UI
  }
  ```
- **Server routes**: return appropriate HTTP status codes with error messages
  ```ts
  if (!article) {
    return reply.status(404).send({ error: '文章未找到' });
  }
  ```
- **Server startup**: wrap in try/catch, log error, `process.exit(1)`

### Architecture Patterns

- **State**: single Zustand store (`useStore`) — one file, all global state
- **API calls**: centralized in `src/api/index.js` with named exports (`articleAPI`, `projectAPI`)
- **Routing**: react-router-dom v7, routes in `App.jsx`
- **Server routes**: each resource in `src/routes/`, exported as async function
- **Database**: Mongoose schemas + TypeScript interfaces in `src/models/`

## Docker

### Basic Commands

```bash
docker-compose up --build     # Build and start all services (frontend:80, backend:3000, mongodb:27017)
docker-compose up             # Start existing containers
docker-compose down           # Stop all services and remove containers
docker-compose ps             # Show running containers
docker-compose logs           # Show logs from all services
docker-compose logs -f        # Follow logs (real-time)
docker-compose logs backend   # Show only backend logs
```

### Service Details

- **frontend**: Nginx serving built client on port 80/443
- **backend**: Node.js Fastify API on port 3000
- **mongodb**: MongoDB database on port 27017 (volume: `mongodb-data`)

### Development vs Production

- **Development**: Run `npm run dev` in client/ and server/ directories separately
- **Production**: Use `docker-compose up --build` with `.env.production` file

### Container Management

```bash
# Build specific service
docker-compose build backend

# Restart service
docker-compose restart backend

# Execute command in running container
docker-compose exec backend sh

# View container resource usage
docker-compose stats
```

## Deployment Notes

- No CI/CD pipeline configured
- Manual deployment via Docker Compose
- Database seeded via `npm run seed` (server directory)
- Frontend built with `npm run build` before Docker build