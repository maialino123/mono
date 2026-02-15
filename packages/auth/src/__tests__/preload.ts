import { Database } from "bun:sqlite";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

// Mock better-sqlite3 with bun:sqlite (compatible API for better-auth/test)
mock.module("better-sqlite3", () => ({
  default: Database,
  Database,
}));

// Mock vitest exports (used internally by better-auth/test)
mock.module("vitest", () => ({
  afterAll,
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  it,
  expect,
  vi: { spyOn },
}));
