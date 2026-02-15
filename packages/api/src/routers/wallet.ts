import { db } from "@cyberk-flow/db";
import { account, walletAddress } from "@cyberk-flow/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { getAddress, isAddress, verifyMessage } from "viem";
import z from "zod";

import { protectedProcedure } from "../index";

const walletAddressSchema = z.string().refine(isAddress, "Invalid Ethereum address");

export const walletRouter = {
  linkWallet: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        signature: z.string().min(1),
        walletAddress: walletAddressSchema,
        chainId: z.number().int().positive(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const checksumAddress = getAddress(input.walletAddress);

      const isValid = await verifyMessage({
        address: checksumAddress,
        message: input.message,
        signature: input.signature as `0x${string}`,
      });

      if (!isValid) {
        throw new Error("Invalid signature");
      }

      const existing = await db
        .select()
        .from(walletAddress)
        .where(and(eq(walletAddress.address, checksumAddress), eq(walletAddress.chainId, input.chainId)))
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].userId === userId) {
          throw new Error("Wallet already linked to your account");
        }
        throw new Error("Wallet already linked to another account");
      }

      await db.insert(walletAddress).values({
        id: crypto.randomUUID(),
        userId,
        address: checksumAddress,
        chainId: input.chainId,
        isPrimary: false,
      });

      await db.insert(account).values({
        id: crypto.randomUUID(),
        userId,
        providerId: "siwe",
        accountId: `${checksumAddress}:${input.chainId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),
};
