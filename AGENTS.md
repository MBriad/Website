# AGENTS.md

## Project Overview

Monorepo personal website with two workspaces:

- **`client/`** — Vite + React (JSX), Zustand state management, Framer Motion animations, react-router-dom
- **`server/`** — Fastify + TypeScript, Mongoose (MongoDB), JWT auth, Vitest

No pre-commit hooks are configured.

## Build / Dev Commands

All commands run from their respective directory (`client/` or `server/`).

### Client (`client/`)

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build (vite build)
npm run preview  # Preview production build
npm run lint     # Run ESLint (eslint.config.js)
npm run test     # Run Vitest tests once
npm run test:watch # Run Vitest in watch mode
```

### Server (`server/`)

```bash
npm run dev      # Start dev server with tsx watch
npm run build    # Compile TypeScript (tsc)
npm run start    # Run compiled output (node dist/index.js)
npm run seed     # Seed database (tsx src/scripts/seed.ts)
npm run test     # Run Vitest tests once
npm run test:watch # Run Vitest in watch mode
```

### Linting

- Client: `npm run lint` (runs `npx eslint .` via `eslint.config.js`)
- Server: no linter; rely on `tsc` strict mode for type checking (`npm run build`)
- No project-wide format scripts exist

### Testing

- **Test runner**: Vitest (both client and server)
- **Client tests**: `*.test.{js,jsx}` in `src/` — uses `@testing-library/react`, `jsdom` environment
- **Client config**: `client/vitest.config.js` — `globals: true`, `environment: 'jsdom'`
- **Server tests**: `*.test.ts` in `src/` — `mongodb-memory-server` for isolated DB tests
- **Server config**: `server/vitest.config.ts` — `globals: true`, `environment: 'node'`
- **Run single test**: `npm run test -- src/components/Loading.test.jsx` (client) or `npm run test -- src/routes/articles.test.ts` (server)
- **Structure**: `describe`/`it` blocks, `beforeAll`/`afterAll` for setup/teardown

```bash
npm run test           # Run all tests once (both sides)
npm run test:watch     # Run tests in watch mode
npm run test -- src/components/Loading.test.jsx  # Run single client test
npm run test -- src/routes/articles.test.ts      # Run single server test
```

## Code Style

### General

- Write **concise, functional code** — avoid unnecessary abstractions
- Comments are welcome but not required; when present, use the JSDoc header format on files:

```js
/**
 * @file src/components/Foo.jsx
 * @brief One-line description
 * @details Optional longer explanation
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
- CSS: import order in `main.jsx` — variables first, global, then component CSS
- ESLint rule: `no-unused-vars` errors, ignoring `^[A-Z_]` pattern

### Server (TypeScript)

- Files use `.ts` extension
- ESM imports must include `.js` extension: `import { Article } from '../models/Article.js'`
- Models: define a Mongoose `interface` with `I` prefix + `PascalCase`, export typed model
- Routes: export async function taking `FastifyInstance`, register routes inside
- TypeScript strict mode is enabled (`tsconfig.json`)
- Target: ES2022, module: ESNext

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
| Zustand actions | camelCase verbs | `toggleTheme`, `openSearch` |
| TS interfaces | I-prefix | `IArticle` |
| TS models | PascalCase | `Article`, `Project` |
| API endpoints | `/api/resource` | `/api/articles/:slug` |
| CSS files | camelCase or kebab-case | `global.css`, `article-detail.css` |
| Test files | `*.test.{js,jsx}` (client), `*.test.ts` (server) | `Loading.test.jsx`, `auth.test.ts` |

### Error Handling

- **Client API layer**: Axios interceptors handle responses; callers handle errors via try/catch or promise rejection
- **Server routes**: return `reply.status(404).send({ error: '...' })` for not-found; unhandled errors bubble to Fastify's logger
- **Server startup**: wrap in try/catch, log error, `process.exit(1)`

### Architecture Patterns

- **State**: single Zustand store (`useStore`) — one file, all global state
- **API calls**: centralized in `src/api/index.js` with named exports (`articleAPI`, `projectAPI`, etc.)
- **Routing**: react-router-dom v7, routes defined in `App.jsx`
- **Server plugins**: registered in `registerPlugins()` before routes
- **Server routes**: each resource has its own file in `src/routes/`, exported as async function
- **Database models**: Mongoose schemas + TypeScript interfaces in `src/models/`
