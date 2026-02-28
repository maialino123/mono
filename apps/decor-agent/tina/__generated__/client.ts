import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({
  cacheDir: "C:/Users/Administrator/Documents/mono/apps/decor-agent/tina/__generated__/.cache/1772211421602",
  url: "https://content.tinajs.io/2.1/content/3e0a24c8-4ad9-4921-9424-65f663b229a1/github/main",
  token: "b35dcf7d04840e1b9ae5df6cc0e802555fa4abd7",
  queries,
});
export default client;
