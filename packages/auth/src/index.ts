import { expo } from "@better-auth/expo";
import { db } from "@cyberk-flow/db";
import * as schema from "@cyberk-flow/db/schema/auth";
import { env } from "@cyberk-flow/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { generateRandomString } from "better-auth/crypto";
import { siwe } from "better-auth/plugins";
import { verifyMessage } from "viem";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN, "mybettertapp://", "exp://"],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["google"],
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    expo(),
    siwe({
      domain: new URL(env.CORS_ORIGIN).host,
      emailDomainName: new URL(env.CORS_ORIGIN).host,
      anonymous: true,
      getNonce: async () => {
        return generateRandomString(32, "a-z", "A-Z", "0-9");
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch {
          return false;
        }
      },
    }),
  ],
});
