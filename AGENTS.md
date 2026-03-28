# AGENTS.md

## Project Overview

Monorepo personal website with two workspaces:

- **`client/`** — Vite + React (JSX), Zustand state management, Framer Motion animations, react-router-dom
- **`server/`** — Fastify + TypeScript, Mongoose (MongoDB), JWT auth, Vitest

No pre-commit hooks are configured.

### Directory Structure

```
website/
├── client/          # Vite + React frontend
│   └── src/api/, components/, pages/, store/, styles/
├── server/          # Fastify + TypeScript backend
│   └── src/config/, models/, routes/, middleware/, utils/
└── docker-compose.yml
```

### Environment Setup

Create `.env` files with required variables:

- **`server/.env`**: `MONGO_URI`, `JWT_SECRET`, `PORT=3000`
- **`client/.env`** (optional): `VITE_API_URL`

### Dev Server Ports

- Client: `5173` (Vite default)
- Server: `3000`

## Build / Dev Commands

All commands run from their respective directory (`client/` or `server/`).

### Client (`client/`)

```bash
npm run dev           # Start Vite dev server
npm run build         # Production build (vite build)
npm run preview       # Preview production build
npm run lint          # Run ESLint (eslint.config.js)
npm run test          # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
```

### Server (`server/`)

```bash
npm run dev           # Start dev server with tsx watch
npm run build         # Compile TypeScript (tsc)
npm run start         # Run compiled output (node dist/index.js)
npm run seed          # Seed database (tsx src/scripts/seed.ts)
npm run test          # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
```

### Testing

- **Test runner**: Vitest (both client and server)
- **Client tests**: `*.test.{js,jsx}` in `src/` — uses `@testing-library/react`, `jsdom` environment
- **Server tests**: `*.test.ts` in `src/` — `mongodb-memory-server` for isolated DB tests
- **Run single test**: `npm run test -- src/components/Loading.test.jsx` (client) or `npm run test -- src/routes/articles.test.ts` (server)

```bash
npm run test           # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test -- src/components/Loading.test.jsx  # Single client test
npm run test -- src/routes/articles.test.ts      # Single server test
```

### Linting

- Client: `npm run lint` (runs `npx eslint .` via `eslint.config.js`)
- Server: no linter; rely on `tsc` strict mode (`npm run build`)

## Code Style

### General

- Write **concise, functional code** — avoid unnecessary abstractions
- Comments are welcome but not required; when present, use JSDoc header format on files:

```js
/**
 * @file src/components/Foo.jsx
 * @brief One-line description
 * @author MBri
 * @date YYYY-MM-DD
 */
```

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

### Imports

```jsx
// Client — React, third-party, then local
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

### Error Handling

- **Client API layer**: Axios interceptors handle responses; callers handle errors via try/catch
- **Server routes**: return `reply.status(404).send({ error: '...' })` for not-found
- **Server startup**: wrap in try/catch, log error, `process.exit(1)`

### Architecture Patterns

- **State**: single Zustand store (`useStore`) — one file, all global state
- **API calls**: centralized in `src/api/index.js` with named exports (`articleAPI`, `projectAPI`)
- **Routing**: react-router-dom v7, routes in `App.jsx`
- **Server routes**: each resource in `src/routes/`, exported as async function
- **Database**: Mongoose schemas + TypeScript interfaces in `src/models/`

## Docker

```bash
docker-compose up --build     # Build and start all services
docker-compose up             # Start existing containers
docker-compose down           # Stop all services
docker-compose ps             # Show running containers
```

- **Services**: client, server, mongodb
- **Client**: Runs on port 5173
- **Server**: Runs on port 3000
- **MongoDB**: Runs on port 27017