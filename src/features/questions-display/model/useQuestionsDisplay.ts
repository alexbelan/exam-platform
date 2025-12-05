import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import type { Ref } from "vue";
import { useAsyncQuestionsDisplay } from "./useAsyncQuestionsDisplay";
import type {
  QuestionsResponse,
  QuestionsResponseTag,
  QuestionsDisplayFilters,
} from "./types";
import type {
  WorkspaceQuestion,
  WorkspaceQuestionTag,
} from "@entities/questions-card/model/types";
import { useToastClient } from "@shared/hooks/useToastClient";

interface UseQuestionsDisplayOptions {
  filters?: QuestionsDisplayFilters | (() => QuestionsDisplayFilters);
  immediate?: boolean;
  scrollContainer?: Ref<HTMLElement | null>;
}

// Выделенная функция для нормализации тега
function normalizeTag(tag: QuestionsResponseTag): WorkspaceQuestionTag {
  return {
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
  };
}

// Функция для нормализации вопроса
function normalizeQuestion(
  question: QuestionsResponse["questions"][number]
): WorkspaceQuestion {
  return {
    id: question.id,
    title: question.title,
    level: null,
    description: null,
    content: null,
    tags: question.tags.map(normalizeTag),
    isFavorite: question.isFavorite,
  };
}

export function useQuestionsDisplay(options?: UseQuestionsDisplayOptions) {
  const { getQuestions, toggleFavorite } = useAsyncQuestionsDisplay();
  const toast = useToastClient();
  const filtersSource = options?.filters;
  const filters = computed(() => {
    if (typeof filtersSource === "function") {
      return filtersSource();
    }
    return filtersSource ?? {};
  });

  const queryParams = computed(() => ({
    limit: 12,
    search: filters.value.search?.trim(),
    tags: filters.value.tags,
    status: true,
  }));

  // Ключ кеша для первой страницы
  const cacheKey = computed(
    () => `workspace-questions-page1-${JSON.stringify(queryParams.value)}`
  );

  // Кеширование первой страницы через useAsyncData
  const {
    data: firstPageData,
    pending,
    error,
    refresh: refreshFirstPage,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await getQuestions({
        ...queryParams.value,
        page: 1,
        limit: 12,
      });

      const normalizedQuestions = response.questions.map(normalizeQuestion);

      return {
        questions: normalizedQuestions,
        pagination: response.pagination,
      };
    },
    {
      immediate: options?.immediate ?? true,
      watch: [queryParams],
      getCachedData: (key: string, nuxtApp: any) => {
        const cached = nuxtApp.payload.data[key];
        if (cached) {
          return cached;
        }
        return undefined;
      },
    }
  );

  // Локальное состояние для всех загруженных страниц
  const questions = ref<WorkspaceQuestion[]>([]);
  const currentPage = ref(1);
  const pagination = ref<QuestionsResponse["pagination"] | null>(null);
  const loadingMore = ref(false);
  const loadMoreError = ref<Error | null>(null);
  const loadMoreTrigger = ref<HTMLElement | null>(null);
  const scrollContainer = options?.scrollContainer;
  const togglingFavorite = ref(false);

  // Синхронизируем данные из кеша с локальным состоянием
  watch(
    firstPageData,
    (newData) => {
      if (newData) {
        questions.value = newData.questions;
        pagination.value = newData.pagination;
        currentPage.value = newData.pagination.page;
      }
    },
    { immediate: true }
  );

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return currentPage.value < pagination.value.pages;
  });

  // Объединенная ошибка (из useAsyncData или из загрузки дополнительных страниц)
  const combinedError = computed(() => error.value || loadMoreError.value);

  // Загрузка дополнительных страниц (без кеширования)
  const fetchMoreQuestions = async (page: number) => {
    if (!hasMore.value || loadingMore.value || pending.value) return;

    try {
      loadingMore.value = true;
      loadMoreError.value = null;

      const response = await getQuestions({
        ...queryParams.value,
        page,
        limit: 12,
      });

      const normalizedQuestions = response.questions.map(normalizeQuestion);

      // Добавляем к существующим вопросам
      questions.value = [...questions.value, ...normalizedQuestions];
      pagination.value = response.pagination;
      currentPage.value = response.pagination.page;
    } catch (err) {
      loadMoreError.value = err as Error;
      console.error("Error fetching more questions:", err);
    } finally {
      loadingMore.value = false;
    }
  };

  const loadMore = async () => {
    await fetchMoreQuestions(currentPage.value + 1);
  };

  const refresh = async () => {
    // Обновляем первую страницу (использует кеш useAsyncData)
    await refreshFirstPage();
    // Сбрасываем дополнительные страницы
    if (firstPageData.value) {
      questions.value = firstPageData.value.questions;
      pagination.value = firstPageData.value.pagination;
      currentPage.value = firstPageData.value.pagination.page;
    }
  };

  // Функция переключения избранного
  const handleToggleBookmark = async (questionId: number) => {
    if (togglingFavorite.value) return;

    // Находим вопрос в массиве
    const question = questions.value.find((q) => q.id === questionId);
    if (!question) return;

    // Оптимистичное обновление UI - меняем isFavorite напрямую
    const wasFavorite = question.isFavorite ?? false;
    question.isFavorite = !wasFavorite;

    try {
      togglingFavorite.value = true;
      const result = await toggleFavorite(questionId);

      // Синхронизируем с ответом сервера
      question.isFavorite = result.isFavorite;

      // Показываем уведомление
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: result.message,
        life: 3000,
      });

      // Очищаем кеш - при следующем обращении к данным они загрузятся заново
      // НЕ вызывает немедленную перезагрузку, только помечает кеш как устаревший
      await clearNuxtData(cacheKey.value);
    } catch (err) {
      // Откатываем при ошибке
      question.isFavorite = wasFavorite;

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail:
          err instanceof Error ? err.message : "Не удалось обновить избранное",
        life: 3000,
      });
    } finally {
      togglingFavorite.value = false;
    }
  };

  // Настройка Intersection Observer для бесконечной прокрутки
  if (options?.immediate !== false) {
    onMounted(async () => {
      await nextTick();

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0] &&
            entries[0].isIntersecting &&
            hasMore.value &&
            !loadingMore.value &&
            !pending.value
          ) {
            loadMore();
          }
        },
        {
          root: null, // null означает viewport (вся страница)
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

  console.log(questions.value);

  return {
    questions,
    pending,
    loadingMore,
    error: combinedError,
    hasMore,
    loadMoreTrigger,
    refresh,
    loadMore,
    handleToggleBookmark,
    isTogglingFavorite: computed(() => togglingFavorite.value),
  };
}
