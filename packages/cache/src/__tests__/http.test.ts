import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.fn();
const mockSetex = vi.fn();
const mockDel = vi.fn();

vi.mock("@cyberk-flow/db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
    del: mockDel,
  }),
}));

const { httpCache, httpInvalidate } = await import("../http");

describe("httpCache middleware", () => {
  let app: Hono;
  let handlerCalled: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerCalled = false;
    app = new Hono();
  });

  it("should return MISS on cache miss and cache the response", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    app.get("/test", httpCache(), (c) => {
      handlerCalled = true;
      return c.json({ data: "fresh" });
    });

    const res = await app.request("/test");

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(handlerCalled).toBe(true);
    expect(mockGet).toHaveBeenCalledWith("http://localhost/test");
    expect(mockSetex).toHaveBeenCalledWith("http://localhost/test", 2, expect.any(String));
  });

  it("should return HIT on cache hit and skip handler", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ data: "cached" }));

    app.get("/test", httpCache(), (c) => {
      handlerCalled = true;
      return c.json({ data: "fresh" });
    });

    const res = await app.request("/test");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBe("HIT");
    expect(body).toEqual({ data: "cached" });
    expect(handlerCalled).toBe(false);
    expect(mockSetex).not.toHaveBeenCalled();
  });

  it("should bypass cache for POST requests", async () => {
    app.post("/test", httpCache(), (c) => {
      handlerCalled = true;
      return c.json({ ok: true });
    });

    const res = await app.request("/test", { method: "POST" });

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBeNull();
    expect(handlerCalled).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should use custom cache key", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    app.get("/users/:id", httpCache({ key: (c) => `users:${c.req.param("id")}` }), (c) =>
      c.json({ id: c.req.param("id") }),
    );

    await app.request("/users/123");

    expect(mockGet).toHaveBeenCalledWith("users:123");
    expect(mockSetex).toHaveBeenCalledWith("users:123", 2, expect.any(String));
  });

  it("should use custom TTL", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    app.get("/test", httpCache({ ttl: 300 }), (c) => c.json({ data: "test" }));

    await app.request("/test");

    expect(mockSetex).toHaveBeenCalledWith(expect.any(String), 300, expect.any(String));
  });

  it("should skip cache when condition returns false", async () => {
    app.get("/test", httpCache({ condition: (c) => !c.req.header("Authorization") }), (c) => {
      handlerCalled = true;
      return c.json({ data: "test" });
    });

    const res = await app.request("/test", {
      headers: { Authorization: "Bearer token" },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBeNull();
    expect(handlerCalled).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe("httpInvalidate middleware", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
  });

  it("should invalidate single key on successful POST", async () => {
    mockDel.mockResolvedValue(1);

    app.post("/users", httpInvalidate({ keys: "users:list" }), (c) => c.json({ created: true }));

    const res = await app.request("/users", { method: "POST" });

    expect(res.status).toBe(200);
    expect(mockDel).toHaveBeenCalledWith("users:list");
  });

  it("should invalidate multiple keys on success", async () => {
    mockDel.mockResolvedValue(1);

    app.post("/users", httpInvalidate({ keys: ["users:list", "users:count"] }), (c) => c.json({ ok: true }));

    await app.request("/users", { method: "POST" });

    expect(mockDel).toHaveBeenCalledWith("users:list");
    expect(mockDel).toHaveBeenCalledWith("users:count");
  });

  it("should support dynamic key from request context", async () => {
    mockDel.mockResolvedValue(1);

    app.delete("/users/:id", httpInvalidate({ keys: (c) => `users:${c.req.param("id")}` }), (c) =>
      c.json({ deleted: true }),
    );

    await app.request("/users/456", { method: "DELETE" });

    expect(mockDel).toHaveBeenCalledWith("users:456");
  });

  it("should not invalidate on error response", async () => {
    app.post("/users", httpInvalidate({ keys: "users:list" }), (c) => c.json({ error: "Bad Request" }, 400));

    const res = await app.request("/users", { method: "POST" });

    expect(res.status).toBe(400);
    expect(mockDel).not.toHaveBeenCalled();
  });

  it("should support async key function", async () => {
    mockDel.mockResolvedValue(1);

    app.post(
      "/users",
      httpInvalidate({
        keys: async () => {
          await Promise.resolve();
          return ["users:list", "users:recent"];
        },
      }),
      (c) => c.json({ ok: true }),
    );

    await app.request("/users", { method: "POST" });

    expect(mockDel).toHaveBeenCalledWith("users:list");
    expect(mockDel).toHaveBeenCalledWith("users:recent");
  });
});
