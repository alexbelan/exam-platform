import { computed } from "vue";
import { useProfileStateStore } from "@entities/profile-state";
import { getProfileStatistics } from "../api/profile-statistics.api";
import type { UseProfileStatisticsReturn } from "./types";
import type { ProfileStatistics } from "@entities/profile-state";

export function useProfileStatistics(): UseProfileStatisticsReturn {
  const store = useProfileStateStore();

  // Получаем userId из сессии
  const { user } = useUserSession();
  const userId = computed(() => user.value?.id);

  // Загружаем статистику с кешированием
  const { data, pending, error, refresh } = useAsyncData(
    () => `profile-statistics-${userId.value}`,
    async () => {
      // Если есть данные в store, используем их сразу
      if (store.hasStatistics && store.lastFetch.statistics) {
        const age = Date.now() - store.lastFetch.statistics;
        // Если данные свежие (менее 5 минут), обновляем в фоне
        if (age < 5 * 60 * 1000) {
          refresh();
          return store.statistics;
        }
        // Если данные старые, всё равно возвращаем их, но обновляем в фоне
        refresh();
        return store.statistics;
      }

      // Загружаем данные
      const response = await getProfileStatistics();

      // Преобразуем в нужный формат
      const statistics: ProfileStatistics = {
        totalTestsCompleted: response.totalTestsCompleted,
        totalQuestionsAnswered: response.totalQuestionsAnswered,
        totalCorrectAnswers: response.totalCorrectAnswers,
        averageScore: response.averageScore,
        problematicQuestionsCount: response.problematicQuestionsCount,
        uncorrectedQuestionsCount: response.uncorrectedQuestionsCount,
        lastActivityAt: response.lastActivityAt
          ? new Date(response.lastActivityAt)
          : null,
      };

      // Сохраняем в store
      store.setStatistics(statistics);

      return statistics;
    },
    {
      immediate: true,
      default: () => store.statistics,
      server: false, // Не загружаем на сервере, только на клиенте
    }
  );

  // Обновляем store при изменении данных
  watch(data, (newData) => {
    if (newData) {
      store.setStatistics(newData);
    }
  });

  return {
    statistics: computed(() => data.value),
    pending: computed(() => pending.value),
    error: computed(() => error.value as Error | null),
    refresh,
  };
}
