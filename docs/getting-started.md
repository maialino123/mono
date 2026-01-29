# Getting Started

Step-by-step guide to set up and run the **cyberk-flow** monorepo locally.

## Prerequisites

- [Bun](https://bun.sh/) (v1.3.6+)
- [Docker](https://www.docker.com/) (for PostgreSQL & Redis)
- [Git](https://git-scm.com/)

## 1. Install Dependencies

```bash
bun install
```

This installs all dependencies across the monorepo (apps + packages) using Bun workspaces.

## 2. Start Docker Services

The project uses Docker Compose to run **PostgreSQL** and **Redis**. The compose file is located at `packages/db/docker-compose.yml`.

```bash
# Start containers in detached mode
bun run db:start

# Or watch logs in foreground
bun run db:watch
```

This starts:

| Service      | Host            | Credentials                  |
| ------------ | --------------- | ---------------------------- |
| **PostgreSQL** | `localhost:5432` | user: `postgres`, password: `password`, db: `cyberk-flow` |
| **Redis**      | `localhost:6379` | password: `password`         |
| **Redis Insight** | `localhost:8001` | (web UI)                  |

Other useful Docker commands:

```bash
bun run db:stop   # Stop containers (keep data)
bun run db:down   # Stop & remove containers + networks
```

## 3. Configure Environment Variables

Copy the example env files and adjust as needed:

```bash
# Server
cp apps/server/.env.example apps/server/.env

# Web
cp apps/web/.env.example apps/web/.env
```

### Server (`apps/server/.env`)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Server URL for auth callbacks |
| `CORS_ORIGIN` | Yes | Allowed frontend origin |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

### Web (`apps/web/.env`)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Backend API URL |

## 4. Push Database Schema

Once Docker is running and `.env` is configured:

```bash
bun run db:push
```

This uses Drizzle Kit to push the schema to your PostgreSQL database.

## 5. Run Development Servers

```bash
# Start all apps (server + web)
bun run dev

# Or start individually
bun run dev:server   # Hono API at http://localhost:3000
bun run dev:web      # Next.js at http://localhost:3001
```

## 6. Verify

- Web app: [http://localhost:3001](http://localhost:3001)
- API server: [http://localhost:3000](http://localhost:3000)
- DB Studio: `bun run db:studio`

## Quick Reference

| Command | Description |
| ------- | ----------- |
| `bun install` | Install all dependencies |
| `bun run dev` | Start all apps |
| `bun run dev:server` | Start server only |
| `bun run dev:web` | Start web only |
| `bun run dev:native` | Start Expo dev server |
| `bun run db:start` | Start Docker (PostgreSQL + Redis) |
| `bun run db:push` | Push Drizzle schema to DB |
| `bun run db:studio` | Open Drizzle Studio UI |
| `bun run check` | Lint & format (Biome) |
| `bun run check-types` | TypeScript typecheck |
