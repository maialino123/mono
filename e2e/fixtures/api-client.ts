import type { AppRouterClient } from "@cyberk-flow/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import playwrightConfig from "../../playwright.config";

const serverPort = playwrightConfig.webServer?.[0]?.port ?? 3000;

const link = new RPCLink({
  url: `http://localhost:${serverPort}/rpc`,
});

export const apiClient: AppRouterClient = createORPCClient(link);
