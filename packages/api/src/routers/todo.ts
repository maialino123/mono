import { orpcCache, orpcInvalidate } from "@cyberk-flow/cache";
import { db } from "@cyberk-flow/db";
import { todo } from "@cyberk-flow/db/schema/todo";
import { eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../index";

const TODO_CACHE_KEYS = {
  list: "todo/getAll{}",
};

export const todoRouter = {
  getAll: publicProcedure.use(orpcCache({ key: TODO_CACHE_KEYS.list, ttl: 2 })).handler(async () => {
    return await db.select().from(todo);
  }),

  create: publicProcedure
    .use(orpcInvalidate({ keys: TODO_CACHE_KEYS.list }))
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      return await db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .use(orpcInvalidate({ keys: TODO_CACHE_KEYS.list }))
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input }) => {
      return await db.update(todo).set({ completed: input.completed }).where(eq(todo.id, input.id));
    }),

  delete: publicProcedure
    .use(orpcInvalidate({ keys: TODO_CACHE_KEYS.list }))
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      return await db.delete(todo).where(eq(todo.id, input.id));
    }),
};
