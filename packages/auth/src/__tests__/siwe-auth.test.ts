import { beforeAll, describe, expect, it, spyOn } from "bun:test";
import { siweClient } from "better-auth/client/plugins";
import { siwe } from "better-auth/plugins";
import { getTestInstance } from "better-auth/test";

const WALLET_A = "0x000000000000000000000000000000000000dEaD";
const WALLET_B = "0x0000000000000000000000000000000000001234";
const CHAIN_ID = 11155111;

type Instance = Awaited<ReturnType<typeof createInstance>>;

async function createInstance(opts?: { allowDifferentEmails?: boolean }) {
  return getTestInstance(
    {
      plugins: [
        siwe({
          domain: "localhost",
          emailDomainName: "localhost",
          anonymous: true,
          getNonce: async () => "test-nonce-12345678901234567890",
          verifyMessage: async ({ signature }) => signature === "valid_signature",
        }),
      ],
      account: {
        accountLinking: {
          allowDifferentEmails: opts?.allowDifferentEmails ?? false,
          trustedProviders: ["google"],
        },
      },
    },
    {
      clientOptions: {
        plugins: [siweClient()],
      },
    },
  );
}

async function siweSignIn(
  client: Instance["client"],
  sessionSetter: Instance["sessionSetter"],
  wallet: string = WALLET_A,
  chainId: number = CHAIN_ID,
) {
  const headers = new Headers();
  await client.siwe.nonce({ walletAddress: wallet, chainId });
  await client.siwe.verify(
    {
      message: "valid_message",
      signature: "valid_signature",
      walletAddress: wallet,
      chainId,
    },
    { onSuccess: sessionSetter(headers) },
  );
  return headers;
}

function mockGoogleIdToken(auth: Instance["auth"], googleUserId: string, googleEmail: string) {
  return auth.$context.then((ctx) => {
    const googleProvider = ctx.socialProviders.find((v) => v.id === "google");
    if (!googleProvider) throw new Error("Google provider not found in socialProviders");
    spyOn(googleProvider, "verifyIdToken").mockResolvedValue(true);
    spyOn(googleProvider, "getUserInfo").mockResolvedValue({
      data: {},
      user: {
        id: googleUserId,
        email: googleEmail,
        name: "Test User",
        emailVerified: true,
        image: "",
      },
    });
  });
}

// =============================================================================
// 1. SIWE sign-in
// =============================================================================
describe("SIWE sign-in", () => {
  let client: Instance["client"];
  let sessionSetter: Instance["sessionSetter"];

  beforeAll(async () => {
    ({ client, sessionSetter } = await createInstance());
  });

  it("should create a new anonymous user on first wallet sign-in", async () => {
    const headers = await siweSignIn(client, sessionSetter);
    const session = await client.getSession({ fetchOptions: { headers } });
    expect(session.data?.user).toBeTruthy();
    expect(session.data?.user.email.toLowerCase()).toContain(WALLET_A.toLowerCase());
    expect(session.data?.user.email).toContain("@localhost");
  });

  it("should return existing user on repeated wallet sign-in", async () => {
    const h1 = await siweSignIn(client, sessionSetter);
    const s1 = await client.getSession({ fetchOptions: { headers: h1 } });

    const h2 = await siweSignIn(client, sessionSetter);
    const s2 = await client.getSession({ fetchOptions: { headers: h2 } });

    expect(s1.data?.user.id).toBe(s2.data?.user.id);
  });

  it("should reject invalid signature", async () => {
    await client.siwe.nonce({ walletAddress: WALLET_B, chainId: CHAIN_ID });
    const res = await client.siwe.verify({
      message: "valid_message",
      signature: "invalid_signature",
      walletAddress: WALLET_B,
      chainId: CHAIN_ID,
    });
    expect(res.error).toBeTruthy();
  });

  it("should fail with no nonce requested", async () => {
    const res = await client.siwe.verify({
      message: "valid_message",
      signature: "valid_signature",
      walletAddress: "0x0000000000000000000000000000000000005678",
      chainId: CHAIN_ID,
    });
    expect(res.error).toBeTruthy();
  });

  it("should create different users for different wallets", async () => {
    const h1 = await siweSignIn(client, sessionSetter, WALLET_A);
    const s1 = await client.getSession({ fetchOptions: { headers: h1 } });

    const h2 = await siweSignIn(client, sessionSetter, WALLET_B);
    const s2 = await client.getSession({ fetchOptions: { headers: h2 } });

    expect(s1.data?.user.id).not.toBe(s2.data?.user.id);
  });

  it("should handle different chains for same wallet (same user)", async () => {
    const h1 = await siweSignIn(client, sessionSetter, WALLET_A, 1);
    const s1 = await client.getSession({ fetchOptions: { headers: h1 } });

    const h2 = await siweSignIn(client, sessionSetter, WALLET_A, CHAIN_ID);
    const s2 = await client.getSession({ fetchOptions: { headers: h2 } });

    expect(s1.data?.user.id).toBe(s2.data?.user.id);
  });
});

// =============================================================================
// 2. Wallet sign-in → link Google (via idToken path, no redirect)
// =============================================================================
describe("Wallet sign-in → link Google", () => {
  it("should FAIL when allowDifferentEmails=false (different emails)", async () => {
    const inst = await createInstance({ allowDifferentEmails: false });
    const headers = await siweSignIn(inst.client, inst.sessionSetter);
    await mockGoogleIdToken(inst.auth, "g-1", "different@gmail.com");

    const res = await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    expect(res.error).toBeTruthy();
    expect(res.error?.statusText).toBe("UNAUTHORIZED");
  });

  it("should SUCCEED when allowDifferentEmails=true", async () => {
    const inst = await createInstance({ allowDifferentEmails: true });
    const headers = await siweSignIn(inst.client, inst.sessionSetter);
    await mockGoogleIdToken(inst.auth, "g-2", "wallet-user@gmail.com");

    const res = await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    expect(res.error).toBeNull();

    const accounts = await inst.client.listAccounts({ fetchOptions: { headers } });
    const ids = accounts.data?.map((a) => a.providerId) ?? [];
    expect(ids).toContain("siwe");
    expect(ids).toContain("google");
  });

  it("should not duplicate if Google already linked (same accountId)", async () => {
    const inst = await createInstance({ allowDifferentEmails: true });
    const headers = await siweSignIn(inst.client, inst.sessionSetter);
    await mockGoogleIdToken(inst.auth, "g-3", "wallet-user@gmail.com");

    // Link first time
    await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    // Link second time (same google id)
    await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    const accounts = await inst.client.listAccounts({ fetchOptions: { headers } });
    expect(accounts.data?.length).toBe(2); // siwe + google, not duplicated
  });

  it("should link Google even if account was previously unlinked", async () => {
    const inst = await createInstance({ allowDifferentEmails: true });
    const headers = await siweSignIn(inst.client, inst.sessionSetter);
    await mockGoogleIdToken(inst.auth, "g-4", "wallet-user@gmail.com");

    // Link
    await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    // Unlink
    await inst.client.unlinkAccount({
      providerId: "google",
      fetchOptions: { headers },
    });

    let accounts = await inst.client.listAccounts({ fetchOptions: { headers } });
    expect(accounts.data?.length).toBe(1); // only siwe

    // Re-link
    await inst.client.linkSocial({
      provider: "google",
      callbackURL: "/callback",
      idToken: { token: "test-id-token" },
      fetchOptions: { headers },
    });

    accounts = await inst.client.listAccounts({ fetchOptions: { headers } });
    expect(accounts.data?.length).toBe(2);
  });
});

// =============================================================================
// 3. Google/email sign-in → SIWE verify (NOT linking — creates new user)
// =============================================================================
describe("Email sign-in → SIWE verify", () => {
  it("SIWE verify creates a separate wallet user (not linked to email user)", async () => {
    const inst = await createInstance({ allowDifferentEmails: true });

    const { headers: emailHeaders } = await inst.signInWithTestUser();
    const emailSession = await inst.client.getSession({ fetchOptions: { headers: emailHeaders } });

    const walletHeaders = await siweSignIn(inst.client, inst.sessionSetter, WALLET_B);
    const walletSession = await inst.client.getSession({ fetchOptions: { headers: walletHeaders } });

    expect(walletSession.data?.user.id).not.toBe(emailSession.data?.user.id);
  });
});
