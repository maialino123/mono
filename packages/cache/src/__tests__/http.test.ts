import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

const mockGet = vi.fn();
const mockSetex = vi.fn();

vi.mock("@cyberk-flow/db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
  }),
}));

const { cache } = await import("../http");

describe("HTTP cache middleware", () => {
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

    app.get("/test", cache(), (c) => {
      handlerCalled = true;
      return c.json({ data: "fresh" });
    });

    const res = await app.request("/test");

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(handlerCalled).toBe(true);
    expect(mockGet).toHaveBeenCalledWith("http://localhost/test");
    expect(mockSetex).toHaveBeenCalledWith(
      "http://localhost/test",
      2,
      expect.any(String)
    );
  });

  it("should return HIT on cache hit and skip handler", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ data: "cached" }));

    app.get("/test", cache(), (c) => {
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
    app.post("/test", cache(), (c) => {
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

    app.get(
      "/users/:id",
      cache({ key: (c) => `users:${c.req.param("id")}` }),
      (c) => c.json({ id: c.req.param("id") })
    );

    await app.request("/users/123");

    expect(mockGet).toHaveBeenCalledWith("users:123");
    expect(mockSetex).toHaveBeenCalledWith("users:123", 2, expect.any(String));
  });

  it("should use custom TTL", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    app.get("/test", cache({ ttl: 300 }), (c) => c.json({ data: "test" }));

    await app.request("/test");

    expect(mockSetex).toHaveBeenCalledWith(expect.any(String), 300, expect.any(String));
  });

  it("should skip cache when condition returns false", async () => {
    app.get(
      "/test",
      cache({ condition: (c) => !c.req.header("Authorization") }),
      (c) => {
        handlerCalled = true;
        return c.json({ data: "test" });
      }
    );

    const res = await app.request("/test", {
      headers: { Authorization: "Bearer token" },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Cache")).toBeNull();
    expect(handlerCalled).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
