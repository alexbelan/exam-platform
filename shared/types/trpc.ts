// Реэкспорт типа AppRouter для использования на клиенте
// Утилиты для извлечения типов из tRPC роутера
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../server/trpc/routers/_app";

export type { AppRouter } from "../../server/trpc/routers/_app";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
