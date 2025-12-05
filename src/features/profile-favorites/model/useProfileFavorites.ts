import { computed } from "vue";
import { useProfileStateStore } from "@entities/profile-state";
import { useAsyncProfileFavorites } from "./useAsyncProfileFavorites";
import type { UseProfileFavoritesReturn } from "./types";

export function useProfileFavorites(): UseProfileFavoritesReturn {
  const store = useProfileStateStore();
  const { getFavoriteQuestions, getFavoriteTests } = useAsyncProfileFavorites();
  const { user } = useUserSession();
  const userId = computed(() => user.value?.id);

  // Загружаем избранные вопросы
  const {
    data: favoriteQuestionsData,
    pending: favoriteQuestionsPending,
    error: favoriteQuestionsError,
    refresh: refreshFavoriteQuestions,
  } = useAsyncData(
    () => `profile-favorite-questions-${userId.value}`,
    async () => {
      // Проверяем кеш в store
      // Если lastFetch === null, значит кеш инвалидирован и нужно загрузить заново
      if (store.hasFavoriteQuestions && store.lastFetch.favoriteQuestions) {
        const age = Date.now() - store.lastFetch.favoriteQuestions;
        // Если данные свежие (меньше 5 минут), возвращаем из кеша
        if (age < 5 * 60 * 1000) {
          return store.favoriteQuestions;
        }
      }

      // Загружаем новые данные с сервера
      const response = await getFavoriteQuestions(1, 100);
      store.setFavoriteQuestions(response.questions);
      return response.questions;
    },
    {
      immediate: false, // Загружаем только по запросу
      default: () => store.favoriteQuestions,
    }
  );

  // Загружаем избранные тесты
  const {
    data: favoriteTestsData,
    pending: favoriteTestsPending,
    error: favoriteTestsError,
    refresh: refreshFavoriteTests,
  } = useAsyncData(
    () => `profile-favorite-tests-${userId.value}`,
    async () => {
      // Проверяем кеш в store
      // Если lastFetch === null, значит кеш инвалидирован и нужно загрузить заново
      if (store.hasFavoriteTests && store.lastFetch.favoriteTests) {
        const age = Date.now() - store.lastFetch.favoriteTests;
        // Если данные свежие (меньше 5 минут), возвращаем из кеша
        if (age < 5 * 60 * 1000) {
          return store.favoriteTests;
        }
      }

      // Загружаем новые данные с сервера
      const response = await getFavoriteTests(1, 100);
      store.setFavoriteTests(response.tests);
      return response.tests;
    },
    {
      immediate: false, // Загружаем только по запросу
      default: () => store.favoriteTests,
    }
  );

  // Убираем watch, так как store уже обновляется внутри useAsyncData
  // Это предотвращает бесконечные циклы обновлений

  return {
    favoriteQuestions: computed(() => favoriteQuestionsData.value || []),
    favoriteQuestionsPending: computed(() => favoriteQuestionsPending.value),
    favoriteQuestionsError: computed(
      () => favoriteQuestionsError.value as Error | null
    ),
    refreshFavoriteQuestions,

    favoriteTests: computed(() => favoriteTestsData.value || []),
    favoriteTestsPending: computed(() => favoriteTestsPending.value),
    favoriteTestsError: computed(
      () => favoriteTestsError.value as Error | null
    ),
    refreshFavoriteTests,
  };
}
