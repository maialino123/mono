import { os } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

const mockRedis = { get: vi.fn(), setex: vi.fn(), del: vi.fn(), sadd: vi.fn(), expire: vi.fn(), smembers: vi.fn() };
vi.mock("@cyberk-flow/db/redis", () => ({ getRedis: () => mockRedis }));

const { orpcCache, orpcInvalidate } = await import("../orpc");

describe("orpcCache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns cached value on hit", async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ cached: true }));
    const proc = os
      .use(orpcCache())
      .handler(async () => ({ data: "fresh" }))
      .callable({ context: {} });
    expect(await proc()).toEqual({ cached: true });
    expect(mockRedis.setex).not.toHaveBeenCalled();
  });

  it("caches result on miss", async () => {
    mockRedis.get.mockResolvedValue(null);
    const proc = os
      .use(orpcCache({ key: "test", ttl: 120 }))
      .handler(async () => ({ data: "fresh" }))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.setex).toHaveBeenCalledWith("test", 120, expect.any(String));
  });

  it("registers key with tag when provided", async () => {
    mockRedis.get.mockResolvedValue(null);
    const proc = os
      .use(orpcCache({ key: "todos:1", tag: "todos", ttl: 60 }))
      .handler(async () => ({}))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.sadd).toHaveBeenCalledWith("tag:todos", "todos:1");
    expect(mockRedis.expire).toHaveBeenCalledWith("tag:todos", 60);
  });

  it("supports dynamic tag function", async () => {
    mockRedis.get.mockResolvedValue(null);
    const proc = os
      .input(z.object({ type: z.string() }))
      .use(orpcCache({ key: "k", tag: (i) => `tag:${i.type}` }))
      .handler(async () => ({}))
      .callable({ context: {} });
    await proc({ type: "active" });
    expect(mockRedis.sadd).toHaveBeenCalledWith("tag:tag:active", "k");
  });

  it("skips tag registration when not provided", async () => {
    mockRedis.get.mockResolvedValue(null);
    const proc = os
      .use(orpcCache({ key: "simple" }))
      .handler(async () => ({}))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.sadd).not.toHaveBeenCalled();
  });
});

describe("orpcInvalidate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates single key", async () => {
    const proc = os
      .use(orpcInvalidate({ keys: "k1" }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.del).toHaveBeenCalledWith("k1");
  });

  it("invalidates multiple keys", async () => {
    const proc = os
      .use(orpcInvalidate({ keys: ["k1", "k2"] }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.del).toHaveBeenCalledWith("k1");
    expect(mockRedis.del).toHaveBeenCalledWith("k2");
  });

  it("supports dynamic key function", async () => {
    const proc = os
      .input(z.object({ id: z.number() }))
      .use(orpcInvalidate({ keys: (i) => `todo:${i.id}` }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc({ id: 123 });
    expect(mockRedis.del).toHaveBeenCalledWith("todo:123");
  });

  it("invalidates by tag", async () => {
    mockRedis.smembers.mockResolvedValue(["todos:1", "todos:2"]);
    const proc = os
      .use(orpcInvalidate({ tags: "todos" }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.smembers).toHaveBeenCalledWith("tag:todos");
    expect(mockRedis.del).toHaveBeenCalledWith("todos:1", "todos:2");
    expect(mockRedis.del).toHaveBeenCalledWith("tag:todos");
  });

  it("invalidates both keys and tags", async () => {
    mockRedis.smembers.mockResolvedValue(["list:1"]);
    const proc = os
      .input(z.object({ id: z.number() }))
      .use(orpcInvalidate({ tags: "list", keys: (i) => `item:${i.id}` }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc({ id: 42 });
    expect(mockRedis.del).toHaveBeenCalledWith("item:42");
    expect(mockRedis.del).toHaveBeenCalledWith("list:1");
  });

  it("handles empty tag set", async () => {
    mockRedis.smembers.mockResolvedValue([]);
    const proc = os
      .use(orpcInvalidate({ tags: "empty" }))
      .handler(async () => ({ ok: true }))
      .callable({ context: {} });
    await proc();
    expect(mockRedis.del).toHaveBeenCalledWith("tag:empty");
  });

  it("skips invalidation when handler returns no output", async () => {
    const proc = os
      .use(orpcInvalidate({ keys: "k" }))
      .handler(async () => undefined)
      .callable({ context: {} });
    await proc();
    expect(mockRedis.del).not.toHaveBeenCalled();
  });
});
