import { os } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.fn();
const mockSetex = vi.fn();

vi.mock("@cyberk-flow/db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
  }),
}));

const { cacheMiddleware } = await import("../orpc");

describe("oRPC cache middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached value on cache hit", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ data: "cached" }));

    let handlerCalled = false;
    const procedure = os
      .use(cacheMiddleware())
      .handler(async () => {
        handlerCalled = true;
        return { data: "fresh" };
      })
      .callable({ context: {} });

    const result = await procedure();

    expect(result).toEqual({ data: "cached" });
    expect(handlerCalled).toBe(false);
    expect(mockSetex).not.toHaveBeenCalled();
  });

  it("should execute handler and cache result on cache miss", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    let handlerCalled = false;
    const procedure = os
      .use(cacheMiddleware())
      .handler(async () => {
        handlerCalled = true;
        return { data: "fresh" };
      })
      .callable({ context: {} });

    const result = await procedure();

    expect(result).toEqual({ data: "fresh" });
    expect(handlerCalled).toBe(true);
    expect(mockSetex).toHaveBeenCalledWith(expect.any(String), 2, JSON.stringify({ data: "fresh" }));
  });

  it("should use default key from path and input", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(cacheMiddleware())
      .handler(async () => ({ data: "test" }))
      .callable({ context: {} });

    await procedure();

    // Default key is path.join('/') + JSON.stringify(input)
    // For callable procedure without router, path is empty
    expect(mockGet).toHaveBeenCalledWith("undefined");
  });

  it("should use custom key function", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(cacheMiddleware({ key: () => "custom:123" }))
      .handler(async () => ({ id: 456 }))
      .callable({ context: {} });

    await procedure();

    expect(mockGet).toHaveBeenCalledWith("custom:123");
    expect(mockSetex).toHaveBeenCalledWith("custom:123", 2, expect.any(String));
  });

  it("should use custom TTL", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(cacheMiddleware({ ttl: 300 }))
      .handler(async () => "data")
      .callable({ context: {} });

    await procedure();

    expect(mockSetex).toHaveBeenCalledWith(expect.any(String), 300, expect.any(String));
  });

  it("should use static string key", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(cacheMiddleware({ key: "static-key" }))
      .handler(async () => "data")
      .callable({ context: {} });

    await procedure();

    expect(mockGet).toHaveBeenCalledWith("static-key");
    expect(mockSetex).toHaveBeenCalledWith("static-key", 2, expect.any(String));
  });
});
