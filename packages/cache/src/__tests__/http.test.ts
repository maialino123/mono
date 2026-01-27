import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedis = { get: vi.fn(), setex: vi.fn(), del: vi.fn() };
vi.mock("@cyberk-flow/db/redis", () => ({ getRedis: () => mockRedis }));

const { httpCache, httpInvalidate } = await import("../http");

describe("httpCache", () => {
  let app: Hono;
  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
  });

  it("returns MISS and caches on miss", async () => {
    mockRedis.get.mockResolvedValue(null);
    app.get("/test", httpCache(), (c) => c.json({ fresh: true }));

    const res = await app.request("/test");
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(mockRedis.setex).toHaveBeenCalledWith("http://localhost/test", expect.any(Number), expect.any(String));
  });

  it("returns HIT on cache hit", async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ cached: true }));
    app.get("/test", httpCache(), (c) => c.json({ fresh: true }));

    const res = await app.request("/test");
    expect(res.headers.get("X-Cache")).toBe("HIT");
    expect(await res.json()).toEqual({ cached: true });
  });

  it("bypasses cache for POST", async () => {
    app.post("/test", httpCache(), (c) => c.json({ ok: true }));
    const res = await app.request("/test", { method: "POST" });
    expect(res.headers.get("X-Cache")).toBeNull();
    expect(mockRedis.get).not.toHaveBeenCalled();
  });

  it("uses custom key and TTL", async () => {
    mockRedis.get.mockResolvedValue(null);
    app.get("/u/:id", httpCache({ key: (c) => `user:${c.req.param("id")}`, ttl: 300 }), (c) => c.json({}));

    await app.request("/u/123");
    expect(mockRedis.setex).toHaveBeenCalledWith("user:123", 300, expect.any(String));
  });

  it("skips cache when condition fails", async () => {
    app.get("/test", httpCache({ condition: (c) => !c.req.header("Auth") }), (c) => c.json({}));
    const res = await app.request("/test", { headers: { Auth: "token" } });
    expect(res.headers.get("X-Cache")).toBeNull();
  });
});

describe("httpInvalidate", () => {
  let app: Hono;
  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
  });

  it.each([
    ["single key", { keys: "k1" }, ["k1"]],
    ["multiple keys", { keys: ["k1", "k2"] }, ["k1", "k2"]],
  ])("invalidates %s on success", async (_, options, expectedKeys) => {
    app.post("/test", httpInvalidate(options), (c) => c.json({ ok: true }));
    await app.request("/test", { method: "POST" });
    for (const k of expectedKeys) expect(mockRedis.del).toHaveBeenCalledWith(k);
  });

  it("supports dynamic key", async () => {
    app.delete("/u/:id", httpInvalidate({ keys: (c) => `user:${c.req.param("id")}` }), (c) => c.json({}));
    await app.request("/u/456", { method: "DELETE" });
    expect(mockRedis.del).toHaveBeenCalledWith("user:456");
  });

  it("skips invalidation on error response", async () => {
    app.post("/test", httpInvalidate({ keys: "k" }), (c) => c.json({}, 400));
    await app.request("/test", { method: "POST" });
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});
