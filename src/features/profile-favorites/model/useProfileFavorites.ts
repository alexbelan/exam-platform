import { computed, watch } from "vue";
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
      // Если есть данные в store, используем их и обновляем в фоне
      if (store.hasFavoriteQuestions && store.lastFetch.favoriteQuestions) {
        const age = Date.now() - store.lastFetch.favoriteQuestions;
        if (age < 5 * 60 * 1000) {
          refreshFavoriteQuestions();
          return store.favoriteQuestions;
        }
      }

      const response = await getFavoriteQuestions(1, 100); // Загружаем все для кеша
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
      // Если есть данные в store, используем их и обновляем в фоне
      if (store.hasFavoriteTests && store.lastFetch.favoriteTests) {
        const age = Date.now() - store.lastFetch.favoriteTests;
        if (age < 5 * 60 * 1000) {
          refreshFavoriteTests();
          return store.favoriteTests;
        }
      }

      const response = await getFavoriteTests(1, 100); // Загружаем все для кеша
      store.setFavoriteTests(response.tests);
      return response.tests;
    },
    {
      immediate: false, // Загружаем только по запросу
      default: () => store.favoriteTests,
    }
  );

  // Обновляем store при изменении данных
  watch(favoriteQuestionsData, (newData) => {
    if (newData) {
      store.setFavoriteQuestions(newData);
    }
  });

  watch(favoriteTestsData, (newData) => {
    if (newData) {
      store.setFavoriteTests(newData);
    }
  });

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
