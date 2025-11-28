import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../types/trpc";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
});
