import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { createContext } from "@cyberk-flow/api/context";
import { appRouter } from "@cyberk-flow/api/routers/index";
import { auth } from "@cyberk-flow/auth";
import { createRateLimitStore, getClientIP } from "@cyberk-flow/cache";
import { env } from "@cyberk-flow/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { convertToModelMessages, streamText, wrapLanguageModel } from "ai";
import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";

type AppEnv = {
  Variables: {
    userId?: string;
  };
};

const app = new Hono<AppEnv>();

type RateLimiterContext = Context<AppEnv>;

// Auth limiter: 100 req/15min per IP (prevent brute-force)
const authLimiter = rateLimiter<AppEnv>({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c: RateLimiterContext) => {
    return `ip:${getClientIP(c)}`;
  },
  store: createRateLimitStore({ prefix: "rl:auth:" }),
});

// API limiter for authenticated users: 100 req/min per user ID
const apiAuthenticatedLimiter = rateLimiter<AppEnv>({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c: RateLimiterContext) => {
    return `user:${c.get("userId")}`;
  },
  store: createRateLimitStore({ prefix: "rl:api:user:" }),
});

// API limiter for anonymous users: 30 req/min per IP
const apiAnonymousLimiter = rateLimiter<AppEnv>({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-6",
  keyGenerator: (c: RateLimiterContext) => `ip:${getClientIP(c)}`,
  store: createRateLimitStore({ prefix: "rl:api:anon:" }),
});

// AI limiter: 10 req/min per user ID (resource intensive)
const aiLimiter = rateLimiter<AppEnv>({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-6",
  keyGenerator: (c: RateLimiterContext) => `user:${c.get("userId") ?? getClientIP(c)}`,
  store: createRateLimitStore({ prefix: "rl:ai:" }),
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", authLimiter);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

// RPC handler with user context and tiered rate limiting
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });

  // Set userId in context for rate limiter
  const userId = context.session?.user?.id;
  if (userId) {
    c.set("userId", userId);
  }

  // Apply appropriate rate limiter based on authentication
  const limiter = userId ? apiAuthenticatedLimiter : apiAnonymousLimiter;
  const limiterResponse = await limiter(c, async () => {});

  if (limiterResponse) {
    return limiterResponse;
  }

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  await next();
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.post(
  "/ai",
  async (c, next) => {
    const context = await createContext({ context: c });
    const userId = context.session?.user?.id;
    if (userId) {
      c.set("userId", userId);
    }
    await next();
  },
  aiLimiter,
  async (c) => {
    const body = await c.req.json();
    const uiMessages = body.messages || [];
    const model = wrapLanguageModel({
      model: google("gemini-2.5-flash"),
      middleware: devToolsMiddleware(),
    });
    const result = streamText({
      model,
      messages: await convertToModelMessages(uiMessages),
    });

    return result.toUIMessageStreamResponse();
  },
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
