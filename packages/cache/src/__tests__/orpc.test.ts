import { os } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

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

const { orpcCache, orpcInvalidate } = await import("../orpc");

describe("orpcCache middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached value on cache hit", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ data: "cached" }));

    let handlerCalled = false;
    const procedure = os
      .use(orpcCache())
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
      .use(orpcCache())
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
      .use(orpcCache())
      .handler(async () => ({ data: "test" }))
      .callable({ context: {} });

    await procedure();

    expect(mockGet).toHaveBeenCalledWith("undefined");
  });

  it("should use custom key function", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(orpcCache({ key: () => "custom:123" }))
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
      .use(orpcCache({ ttl: 300 }))
      .handler(async () => "data")
      .callable({ context: {} });

    await procedure();

    expect(mockSetex).toHaveBeenCalledWith(expect.any(String), 300, expect.any(String));
  });

  it("should use static string key", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");

    const procedure = os
      .use(orpcCache({ key: "static-key" }))
      .handler(async () => "data")
      .callable({ context: {} });

    await procedure();

    expect(mockGet).toHaveBeenCalledWith("static-key");
    expect(mockSetex).toHaveBeenCalledWith("static-key", 2, expect.any(String));
  });
});

describe("orpcInvalidate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should invalidate single key on success", async () => {
    mockDel.mockResolvedValue(1);

    const procedure = os
      .use(orpcInvalidate({ keys: "todo:list" }))
      .handler(async () => ({ success: true }))
      .callable({ context: {} });

    await procedure();

    expect(mockDel).toHaveBeenCalledWith("todo:list");
  });

  it("should invalidate multiple keys on success", async () => {
    mockDel.mockResolvedValue(1);

    const procedure = os
      .use(orpcInvalidate({ keys: ["todo:list", "todo:count"] }))
      .handler(async () => ({ success: true }))
      .callable({ context: {} });

    await procedure();

    expect(mockDel).toHaveBeenCalledWith("todo:list");
    expect(mockDel).toHaveBeenCalledWith("todo:count");
  });

  it("should support dynamic key function", async () => {
    mockDel.mockResolvedValue(1);

    const procedure = os
      .input(z.object({ id: z.number() }))
      .use(orpcInvalidate({ keys: (input) => `todo:${input.id}` }))
      .handler(async () => ({ deleted: true }))
      .callable({ context: {} });

    await procedure({ id: 123 });

    expect(mockDel).toHaveBeenCalledWith("todo:123");
  });

  it("should not invalidate when handler returns no output", async () => {
    const procedure = os
      .use(orpcInvalidate({ keys: "todo:list" }))
      .handler(async () => undefined)
      .callable({ context: {} });

    await procedure();

    expect(mockDel).not.toHaveBeenCalled();
  });

  it("should not invalidate when handler throws", async () => {
    const procedure = os
      .use(orpcInvalidate({ keys: "todo:list" }))
      .handler(async () => {
        throw new Error("Handler failed");
      })
      .callable({ context: {} });

    await expect(procedure()).rejects.toThrow("Handler failed");
    expect(mockDel).not.toHaveBeenCalled();
  });
});
