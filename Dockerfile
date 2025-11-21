# syntax=docker/dockerfile:1.7

# Базовый образ Bun
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Установка системных зависимостей для Prisma
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Установка зависимостей для разработки и сборки
FROM base AS deps
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Сборка приложения
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
ENV NODE_ENV=production
RUN bun --bun run build

# Установка production зависимостей
FROM base AS prod-deps
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile --production

# Production образ
FROM base AS release
ENV NODE_ENV=production
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.output ./.output
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/bun.lock ./bun.lock
RUN bunx prisma generate
RUN mkdir -p .nuxt .output && chown -R bun:bun /usr/src/app
USER bun
EXPOSE 3000/tcp
CMD ["bun", "run", ".output/server/index.mjs"]
