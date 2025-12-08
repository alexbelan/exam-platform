import { cleanupExpiredTokens, cleanupUsedTokens } from "../services/tokens";

export default defineTask({
  meta: {
    name: "token-cleanup",
    description: "Очистка истекших и использованных токенов",
  },
  async run() {
    try {
      const expiredCount = await cleanupExpiredTokens();
      const usedCount = await cleanupUsedTokens(7);

      const totalCleaned = expiredCount + usedCount;

      return { result: { totalCleaned, expiredCount, usedCount } };
    } catch (error) {
      console.error("[Token Cleanup] Ошибка при очистке токенов:", error);
      return { result: { totalCleaned: 0, expiredCount: 0, usedCount: 0 } };
    }
  },
});
