import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import type { Ref } from "vue";
import type {
  QuestionsResponse,
  WorkspaceQuestionsDisplayFilters,
} from "./types";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";

interface UseWorkspaceQuestionsDisplayOptions {
  filters?:
    | WorkspaceQuestionsDisplayFilters
    | (() => WorkspaceQuestionsDisplayFilters);
  immediate?: boolean;
  scrollContainer?: Ref<HTMLElement | null>;
}

export function useWorkspaceQuestionsDisplay(
  options?: UseWorkspaceQuestionsDisplayOptions
) {
  const filtersSource = options?.filters;
  const filters = computed(() => {
    if (typeof filtersSource === "function") {
      return filtersSource();
    }
    return filtersSource ?? {};
  });
  const questions = ref<WorkspaceQuestion[]>([]);
  const currentPage = ref(1);
  const pagination = ref<QuestionsResponse["pagination"] | null>(null);
  const pending = ref(false);
  const loadingMore = ref(false);
  const error = ref<Error | null>(null);
  const loadMoreTrigger = ref<HTMLElement | null>(null);
  const scrollContainer = options?.scrollContainer;

  const queryParams = computed(() => {
    const params: Record<string, string> = { limit: "12", page: "1" };
    if (filters.value.search?.trim()) {
      params.search = filters.value.search.trim();
    }
    if (filters.value.level) {
      params.level = filters.value.level;
    }
    if (filters.value.tags && filters.value.tags.length > 0) {
      params.tags = filters.value.tags.join(",");
    }
    return params;
  });

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return currentPage.value < pagination.value.pages;
  });

  const fetchQuestions = async (page: number, append = false) => {
    try {
      if (page === 1) {
        pending.value = true;
      } else {
        loadingMore.value = true;
      }
      error.value = null;

      const params = { ...queryParams.value, page: page.toString() };
      const response = await $fetch<QuestionsResponse>("/api/questions", {
        query: params,
      });

      const normalizeTag = (
        tag: QuestionsResponse["questions"][number]["tags"][number]
      ) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        category: tag.category
          ? {
              id: tag.category.id,
              name: tag.category.name,
              slug: tag.category.slug,
              color: tag.category.color,
            }
          : null,
      });

      const normalizedQuestions: WorkspaceQuestion[] = response.questions.map(
        (q) => ({
          id: q.id,
          title: q.title,
          level: null,
          description: null,
          content: null,
          tags: q.tags.map(normalizeTag),
        })
      );

      if (append) {
        questions.value = [...questions.value, ...normalizedQuestions];
      } else {
        questions.value = normalizedQuestions;
      }

      pagination.value = response.pagination;
      currentPage.value = response.pagination.page;
    } catch (err) {
      error.value = err as Error;
      console.error("Error fetching questions:", err);
    } finally {
      pending.value = false;
      loadingMore.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value || pending.value) return;
    await fetchQuestions(currentPage.value + 1, true);
  };

  const refresh = async () => {
    currentPage.value = 1;
    await fetchQuestions(1, false);
  };

  // Загрузка при изменении фильтров
  watch(
    queryParams,
    () => {
      currentPage.value = 1;
      fetchQuestions(1, false);
    },
    { deep: true }
  );

  // Инициализация при монтировании
  if (options?.immediate !== false) {
    onMounted(async () => {
      await fetchQuestions(1, false);
      await nextTick();

      // Настройка Intersection Observer для бесконечной прокрутки
      // Используем scrollContainer для отслеживания скролла внутри компонента
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0] &&
            entries[0].isIntersecting &&
            hasMore.value &&
            !loadingMore.value
          ) {
            loadMore();
          }
        },
        {
          root: scrollContainer?.value || null,
          rootMargin: "200px",
        }
      );

      // Наблюдаем за элементом, когда он появляется
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
  }

  return {
    questions,
    pending,
    loadingMore,
    error,
    hasMore,
    loadMoreTrigger,
    refresh,
    loadMore,
  };
}
