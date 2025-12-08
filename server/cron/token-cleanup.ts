import { cleanupExpiredTokens, cleanupUsedTokens } from "../services/tokens";
import { defineCronHandler } from "#nuxt/cron";

export default defineCronHandler(
  () => "0 */12 * * *",
  async () => {
    try {
      await cleanupExpiredTokens();
      await cleanupUsedTokens(7);
    } catch (error) {
      console.error("[Token Cleanup] Ошибка при очистке токенов:", error);
    }
  },
);
