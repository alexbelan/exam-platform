import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../trpc/routers/_app";
import { createContext } from "../../trpc/context";
import { getRequestURL, readRawBody } from "h3";

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // Создаем стандартный Request объект из H3 event
  const headers = new Headers();
  Object.entries(event.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  });

  const request = new Request(url.href, {
    method: event.method,
    headers,
    body:
      event.method !== "GET" && event.method !== "HEAD"
        ? await readRawBody(event, "arrayBuffer").catch(() => null)
        : undefined,
  });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(event),
    onError({ error, path }) {
      console.error(`tRPC Error on '${path}':`, error);
    },
  });
});
