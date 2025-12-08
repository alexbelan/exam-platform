import { computed, ref, watch, onBeforeUnmount, nextTick, type Ref } from "vue";
import { useProfileStateStore } from "@entities/profile-state";
import { useProfileFavorites } from "@features/profile-favorites";
import { useAsyncWorkspaceProfileDisplay } from "./useAsyncWorkspaceProfileDisplay";
import { useAsyncQuestionsDisplay } from "@features/questions-display/model/useAsyncQuestionsDisplay";
import { useAsyncTestsDisplay } from "@features/tests-display/model/useAsyncTestsDisplay";
import { useToastClient } from "@shared/hooks/useToastClient";
import type {
  UseWorkspaceProfileDisplayReturn,
  FavoriteQuestionRaw,
  FavoriteTestRaw,
} from "./types";
import type {
  WorkspaceQuestion,
  WorkspaceQuestionTag,
} from "@entities/questions-card/model/types";
import type {
  WorkspaceTest,
  WorkspaceTestTag,
} from "@entities/test-card/model/types";

export function useWorkspaceProfileDisplay(): UseWorkspaceProfileDisplayReturn {
  let loadMoreTriggerRef: Ref<HTMLElement | null> | null = null;
  let observer: IntersectionObserver | null = null;
  const store = useProfileStateStore();
  const {
    favoriteQuestions,
    favoriteTests,
    refreshFavoriteQuestions,
    refreshFavoriteTests,
  } = useProfileFavorites();
  const { toggleFavorite: toggleFavoriteQuestion } = useAsyncQuestionsDisplay();
  const { toggleFavorite: toggleFavoriteTest } = useAsyncTestsDisplay();
  const toast = useToastClient();

  const activeFilter = computed(() => store.activeFilter);
  const questions = ref<WorkspaceQuestion[]>([]);
  const tests = ref<WorkspaceTest[]>([]);
  const currentPage = ref(1);
  const pagination = ref<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const pending = ref(false);
  const loadingMore = ref(false);
  const error = ref<Error | null>(null);

  const hasMore = computed(() => {
    if (!pagination.value) return false;
    return currentPage.value < pagination.value.pages;
  });

  // Нормализация избранных вопросов
  const normalizeFavoriteQuestion = (
    q: FavoriteQuestionRaw,
  ): WorkspaceQuestion => {
    const normalizeTag = (
      tag: FavoriteQuestionRaw["tags"][number],
    ): WorkspaceQuestionTag => ({
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

    return {
      id: q.id,
      title: q.title,
      level: null,
      description: null,
      content: null,
      tags: (q.tags || []).map(normalizeTag),
      isFavorite: true,
    };
  };

  // Нормализация избранных тестов
  const normalizeFavoriteTest = (t: FavoriteTestRaw): WorkspaceTest => {
    const normalizeTag = (
      tag:
        | NonNullable<FavoriteTestRaw["tags"]>[number]
        | FavoriteTestRaw["primaryTag"],
    ): WorkspaceTestTag => {
      if (!tag) {
        throw new Error("Tag cannot be null");
      }
      return {
        id: tag.id,
        name: tag.name,
        category: tag.category
          ? {
              id: tag.category.id,
              name: tag.category.name,
              color: tag.category.color,
            }
          : null,
      };
    };

    const primaryTag = t.primaryTag ? normalizeTag(t.primaryTag) : null;
    const mappedTags = (t.tags ?? []).map(normalizeTag);
    const tagsWithPrimary =
      primaryTag &&
      !mappedTags.some((tag: WorkspaceTestTag) => tag.id === primaryTag.id)
        ? [primaryTag, ...mappedTags]
        : mappedTags;

    return {
      id: t.id,
      title: t.name,
      description: t.description ?? "",
      questionsCount: t.questionCount,
      questionIds: t.questionIds ?? [],
      isPublished: Boolean(t.isPublished),
      tags: tagsWithPrimary,
      isFavorite: true,
    };
  };

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
            // Нормализуем и помечаем как избранные
            questions.value = favQuestions.map(normalizeFavoriteQuestion);
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
            // Нормализуем и помечаем как избранные
            tests.value = favTests.map(normalizeFavoriteTest);
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

          const normalizedQuestions: WorkspaceQuestion[] =
            response.questions.map((q) => ({
              id: q.id,
              title: q.title,
              level: null,
              description: null,
              content: null,
              tags: q.tags || [],
              isFavorite: q.isFavorite ?? false, // Используем isFavorite из API
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

  // Обработчик переключения избранного для вопросов
  const handleToggleQuestionBookmark = async (questionId: number) => {
    const question = questions.value.find((q) => q.id === questionId);
    if (!question) return;

    const wasFavorite = question.isFavorite ?? false;
    question.isFavorite = !wasFavorite;

    try {
      const result = await toggleFavoriteQuestion(questionId);
      question.isFavorite = result.isFavorite;

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: result.message,
        life: 3000,
      });

      // Инвалидируем кеш в store и useAsyncData, чтобы при следующем обращении данные загружались заново
      store.lastFetch.favoriteQuestions = null;
      const { user } = useUserSession();
      const userId = user.value?.id;
      if (userId) {
        clearNuxtData(`profile-favorite-questions-${userId}`);
      }
    } catch (err) {
      question.isFavorite = wasFavorite;

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail:
          err instanceof Error ? err.message : "Не удалось обновить избранное",
        life: 3000,
      });
    }
  };

  // Обработчик переключения избранного для тестов
  const handleToggleTestBookmark = async (testId: number) => {
    const test = tests.value.find((t) => t.id === testId);
    if (!test) return;

    const wasFavorite = test.isFavorite ?? false;
    test.isFavorite = !wasFavorite;

    try {
      const result = await toggleFavoriteTest(testId);
      test.isFavorite = result.isFavorite;

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: result.message,
        life: 3000,
      });

      store.lastFetch.favoriteTests = null;
      const { user } = useUserSession();
      const userId = user.value?.id;
      if (userId) {
        clearNuxtData(`profile-favorite-tests-${userId}`);
      }
    } catch (err) {
      test.isFavorite = wasFavorite;

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail:
          err instanceof Error ? err.message : "Не удалось обновить избранное",
        life: 3000,
      });
    }
  };

  // Загрузка при изменении фильтра
  watch(
    activeFilter,
    (newFilter, oldFilter) => {
      if (oldFilter && oldFilter !== newFilter) {
        questions.value = [];
        tests.value = [];
        currentPage.value = 1;
        pagination.value = null;
      }
      fetchData(1, false);
    },
    { immediate: true },
  );

  // Настройка Intersection Observer для бесконечной прокрутки
  const setupInfiniteScroll = (triggerRef: Ref<HTMLElement | null>) => {
    loadMoreTriggerRef = triggerRef;

    nextTick(() => {
      if (!loadMoreTriggerRef) return;

      // Очищаем предыдущий observer, если он существует
      if (observer) {
        if (loadMoreTriggerRef.value) {
          observer.unobserve(loadMoreTriggerRef.value);
        }
        observer.disconnect();
      }

      observer = new IntersectionObserver(
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
        },
      );

      watch(
        loadMoreTriggerRef,
        (newVal, oldVal) => {
          if (oldVal && observer) {
            observer.unobserve(oldVal);
          }
          if (newVal && observer) {
            observer.observe(newVal);
          }
        },
        { immediate: true },
      );
    });
  };

  // Очистка observer при размонтировании
  onBeforeUnmount(() => {
    if (observer) {
      if (loadMoreTriggerRef?.value) {
        observer.unobserve(loadMoreTriggerRef.value);
      }
      observer.disconnect();
      observer = null;
    }
  });

  return {
    questions: computed(() => questions.value),
    tests: computed(() => tests.value),
    pending: computed(() => pending.value),
    loadingMore: computed(() => loadingMore.value),
    error: computed(() => error.value),
    hasMore,
    activeFilter,
    refresh,
    handleToggleQuestionBookmark,
    handleToggleTestBookmark,
    setupInfiniteScroll,
  };
}
