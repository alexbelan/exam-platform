import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, type ComputedRef } from "vue";
import { useProfileStateStore } from "@entities/profile-state";
import { useProfileFavorites } from "@features/profile-favorites";
import { useAsyncWorkspaceProfileDisplay } from "./useAsyncWorkspaceProfileDisplay";
import type { UseWorkspaceProfileDisplayReturn } from "./types";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";
import type { WorkspaceTest } from "@entities/test-card/model/types";

export function useWorkspaceProfileDisplay(): UseWorkspaceProfileDisplayReturn {
  const store = useProfileStateStore();
  const { favoriteQuestions, favoriteTests, refreshFavoriteQuestions, refreshFavoriteTests } = useProfileFavorites();

  const activeFilter = computed(() => store.activeFilter);
  const questions = ref<WorkspaceQuestion[]>([]);
  const tests = ref<WorkspaceTest[]>([]);
  const currentPage = ref(1);
  const pagination = ref<{ page: number; limit: number; total: number; pages: number } | null>(null);
  const pending = ref(false);
  const loadingMore = ref(false);
  const error = ref<Error | null>(null);
  const loadMoreTrigger = ref<HTMLElement | null>(null);

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return currentPage.value < pagination.value.pages;
  });

  // Загрузка данных в зависимости от фильтра
  const fetchData = async (page: number, append = false) => {
    try {
      if (page === 1) {
        pending.value = true;
      } else {
        loadingMore.value = true;
      }
      error.value = null;

      switch (activeFilter.value) {
        case "favorite-questions": {
          // Загружаем избранные вопросы через feature
          if (page === 1) {
            await refreshFavoriteQuestions();
            const favQuestions = favoriteQuestions.value || [];
            questions.value = favQuestions;
            tests.value = [];
            // Устанавливаем пагинацию (все данные загружены)
            pagination.value = {
              page: 1,
              limit: favQuestions.length,
              total: favQuestions.length,
              pages: 1,
            };
          }
          break;
        }

        case "favorite-tests": {
          // Загружаем избранные тесты через feature
          if (page === 1) {
            await refreshFavoriteTests();
            const favTests = favoriteTests.value || [];
            tests.value = favTests;
            questions.value = [];
            // Устанавливаем пагинацию (все данные загружены)
            pagination.value = {
              page: 1,
              limit: favTests.length,
              total: favTests.length,
              pages: 1,
            };
          }
          break;
        }

        case "incorrect-answers": {
          // Загружаем неправильные ответы через tRPC
          const { getIncorrectAnswers } = useAsyncWorkspaceProfileDisplay();
          const response = await getIncorrectAnswers(page, 12);
          
          const normalizedQuestions: WorkspaceQuestion[] = response.questions.map((q) => ({
            id: q.id,
            title: q.title,
            level: null,
            description: null,
            content: null,
            tags: q.tags || [],
          }));

          if (append) {
            questions.value = [...questions.value, ...normalizedQuestions];
          } else {
            questions.value = normalizedQuestions;
            store.setIncorrectAnswers(normalizedQuestions);
          }

          tests.value = [];
          pagination.value = response.pagination;
          currentPage.value = response.pagination.page;
          break;
        }
      }
    } catch (err) {
      error.value = err as Error;
      console.error("Error fetching profile content:", err);
    } finally {
      pending.value = false;
      loadingMore.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value || pending.value) return;
    await fetchData(currentPage.value + 1, true);
  };

  const refresh = async () => {
    currentPage.value = 1;
    await fetchData(1, false);
  };

  // Загрузка при изменении фильтра
  watch(
    activeFilter,
    () => {
      currentPage.value = 1;
      fetchData(1, false);
    },
    { immediate: true }
  );

  // Настройка Intersection Observer для бесконечной прокрутки
  onMounted(async () => {
    await nextTick();

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0] &&
          entries[0].isIntersecting &&
          hasMore.value &&
          !loadingMore.value &&
          activeFilter.value === "incorrect-answers" // Только для неправильных ответов есть пагинация
        ) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
      }
    );

    watch(
      loadMoreTrigger,
      (newVal, oldVal) => {
        if (oldVal) {
          observer.unobserve(oldVal);
        }
        if (newVal) {
          observer.observe(newVal);
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      if (loadMoreTrigger.value) {
        observer.unobserve(loadMoreTrigger.value);
      }
      observer.disconnect();
    });
  });

  return {
    questions: computed(() => questions.value),
    tests: computed(() => tests.value),
    pending: computed(() => pending.value),
    loadingMore: computed(() => loadingMore.value),
    error: computed(() => error.value),
    hasMore,
    activeFilter,
    loadMore,
    refresh,
    loadMoreTrigger,
  };
}

