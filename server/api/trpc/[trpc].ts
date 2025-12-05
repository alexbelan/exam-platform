import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../trpc/routers/_app";
import { createContext } from "../../trpc/context";
import { getRequestURL, readRawBody } from "h3";

export default defineEventHandler(async (event: any) => {
  const url = getRequestURL(event);

  // Создаем заголовки
  const headers = new Headers();
  Object.entries(event.headers).forEach(([key, value]) => {
    if (value) {
      // Нормализуем ключи заголовков (lowercase)
      const normalizedKey = key.toLowerCase();
      const headerValue = Array.isArray(value)
        ? value.join(", ")
        : String(value);
      headers.set(normalizedKey, headerValue);
    }
  });

  // Убеждаемся, что Content-Type установлен
  if (event.method === "POST" && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  // Получаем тело запроса
  let body: BodyInit | undefined = undefined;
  if (event.method !== "GET" && event.method !== "HEAD") {
    try {
      const rawBody = await readRawBody(event);
      // Преобразуем в ArrayBuffer для совместимости с Request
      if (rawBody) {
        const rawBodyAny = rawBody as any;
        if (rawBodyAny instanceof ArrayBuffer) {
          body = rawBodyAny as ArrayBuffer;
        } else if (rawBodyAny instanceof Uint8Array) {
          body = rawBodyAny.buffer as ArrayBuffer;
        } else if (typeof rawBody === "string") {
          body = new TextEncoder().encode(rawBody).buffer as ArrayBuffer;
        } else {
          // Для Buffer и других типов
          const uint8Array = new Uint8Array(rawBodyAny as ArrayLike<number>);
          body = uint8Array.buffer as ArrayBuffer;
        }
      }
    } catch {
      // Игнорируем ошибки чтения тела
      body = undefined;
    }
  }

  const request = new Request(url.href, {
    method: event.method,
    headers,
    body,
  });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(event),
    onError({ error, path }: { error: Error; path?: string }) {
      console.error(`tRPC Error on '${path}':`, error);
    },
  });
});
