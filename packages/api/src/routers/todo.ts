import { orpcCache, orpcInvalidate } from "@cyberk-flow/cache";
import { db } from "@cyberk-flow/db";
import { todo } from "@cyberk-flow/db/schema/todo";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../index";

const CACHE_KEYS = {
  tag: "todos",
  list: (input: z.infer<typeof listInputSchema>) => `todos:${JSON.stringify(input)}`,
  byId: (id: number) => `todo:${id}`,
};

const listInputSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  completed: z.boolean().optional(),
  text: z.string().optional(),
  sortBy: z.enum(["createdAt", "text"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const todoRouter = {
  list: publicProcedure
    .input(listInputSchema)
    .use(orpcCache({ key: (input) => CACHE_KEYS.list(input), tag: CACHE_KEYS.tag, ttl: 60 }))
    .handler(async ({ input }) => {
      const { page, limit, completed, text: textFilter, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (completed !== undefined) {
        conditions.push(eq(todo.completed, completed));
      }
      if (textFilter) {
        conditions.push(ilike(todo.text, `%${textFilter}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const orderByClause = sortBy
        ? sortOrder === "desc"
          ? desc(todo[sortBy])
          : asc(todo[sortBy])
        : asc(todo.createdAt);

      const [items, totalResult] = await Promise.all([
        db.select().from(todo).where(whereClause).orderBy(orderByClause).limit(limit).offset(offset),
        db.select({ count: count() }).from(todo).where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, total, page, totalPages };
    }),

  findById: publicProcedure
    .input(z.object({ id: z.number() }))
    .use(orpcCache({ key: (input) => CACHE_KEYS.byId(input.id), ttl: 60 }))
    .handler(async ({ input }) => {
      const result = await db.select().from(todo).where(eq(todo.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .use(orpcInvalidate({ tags: CACHE_KEYS.tag }))
    .handler(async ({ input }) => {
      return await db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .use(orpcInvalidate({ tags: CACHE_KEYS.tag, keys: (input) => CACHE_KEYS.byId(input.id) }))
    .handler(async ({ input }) => {
      return await db.update(todo).set({ completed: input.completed }).where(eq(todo.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .use(orpcInvalidate({ tags: CACHE_KEYS.tag, keys: (input) => CACHE_KEYS.byId(input.id) }))
    .handler(async ({ input }) => {
      return await db.delete(todo).where(eq(todo.id, input.id));
    }),
};
