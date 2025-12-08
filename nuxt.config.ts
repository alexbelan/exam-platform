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
  vite: {
    resolve: {
      alias: {
        "@shared": resolve(rootDir, "src/shared"),
        "@entities": resolve(rootDir, "src/entities"),
        "@features": resolve(rootDir, "src/features"),
        "@pages": resolve(rootDir, "src/pages"),
      },
    },
  },

  alias: {
    "@shared": resolve(rootDir, "src/shared"),
    "@entities": resolve(rootDir, "src/entities"),
    "@features": resolve(rootDir, "src/features"),
    "@pages": resolve(rootDir, "src/pages"),
  },

  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },

  nitro: {
    prerender: {
      routes: ["/", "/login"],
      crawlLinks: true,
    },
    scheduledTasks: {
      "0 */12 * * *": ["token-cleanup"],
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
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
    telegramChannelUsername: process.env.TELEGRAM_CHANNEL_USERNAME,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFrom: process.env.SMTP_FROM,
    smtpFromName: process.env.SMTP_FROM_NAME,
    companyName: process.env.COMPANY_NAME,
    session: {
      password:
        process.env.NUXT_SESSION_PASSWORD ||
        "default-session-password-change-in-production",
      cookie: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 1 месяц
      },
    },
    public: {
      // Публичные переменные (если нужны на клиенте)
    },
  },
});
