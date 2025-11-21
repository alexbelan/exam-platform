// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineNuxtConfig({
  srcDir: "src/app",
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  dir: {
    pages: "routes",
  },

  // Настройка Vite для правильного разрешения алиасов FSD-слоев
  vite: {
    resolve: {
      alias: {
        "@shared": resolve(rootDir, "src/shared"),
        "@entities": resolve(rootDir, "src/entities"),
        "@features": resolve(rootDir, "src/features"),
        "@widgets": resolve(rootDir, "src/widgets"),
        "@pages": resolve(rootDir, "src/pages"),
      },
    },
  },

  // Алиасы для Nuxt (для SSR и сборки)
  alias: {
    "@shared": resolve(rootDir, "src/shared"),
    "@entities": resolve(rootDir, "src/entities"),
    "@features": resolve(rootDir, "src/features"),
    "@widgets": resolve(rootDir, "src/widgets"),
    "@pages": resolve(rootDir, "src/pages"),
  },

  // Для Docker нужно слушать на всех интерфейсах
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  nitro: {
    prerender: {
      routes: ["/", "/login"],
      crawlLinks: true,
    },
  },
  ssr: true,
  // Настройка для SPA-рендеринга админских страниц
  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "nuxt-auth-utils",
    "nuxt-color-picker",
  ],
  primevue: {
    importTheme: { from: "~/themes/theme.ts" },
    options: {
      ripple: true,
    },
  },
  css: [
    "~/assets/css/main.css",
    "quill/dist/quill.snow.css",
    "highlight.js/styles/atom-one-dark.css",
  ],
  // Обновляем пути к компонентам
  components: [
    {
      path: "@shared/ui",
      global: true,
      prefix: "Shared",
      ignore: ["**/index.ts"],
    },
    // {
    //   path: "~/entities",
    //   global: true,
    //   prefix: "Entity",
    //   ignore: ["**/index.ts"],
    // },
    // {
    //   path: "~/features",
    //   global: true,
    //   prefix: "Feature",
    //   ignore: ["**/index.ts"],
    // },
    // Страницы (pages) не должны быть глобальными компонентами
    // Они используются через роутинг Nuxt
  ],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    session: {
      password:
        process.env.NUXT_SESSION_PASSWORD ||
        "default-session-password-change-in-production",
      cookie: {
        sameSite: "lax",
        secure: false, // для разработки
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 неделя
      },
    },
    public: {},
  },
});
