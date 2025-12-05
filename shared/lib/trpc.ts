import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "../types/trpc";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "/api/trpc",
      headers() {
        return {
          "Content-Type": "application/json",
        };
      },
    }),
  ],
});
