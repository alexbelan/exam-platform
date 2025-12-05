import { computed, ref } from "vue";
import { useAsyncTestsDisplay } from "./useAsyncTestsDisplay";
import type {
  TestsDisplayFilters,
  TestsResponseTest,
  TestsResponseTag,
} from "./types";
import type { WorkspaceTest } from "@entities/test-card";
import { useToastClient } from "@shared/hooks/useToastClient";

interface UseTestsDisplayOptions {
  filters?: TestsDisplayFilters | (() => TestsDisplayFilters);
  immediate?: boolean;
}

export function useTestsDisplay(options?: UseTestsDisplayOptions) {
  const { getTests, toggleFavorite } = useAsyncTestsDisplay();
  const toast = useToastClient();
  const filtersSource = options?.filters;
  const filters = computed(() => {
    if (typeof filtersSource === "function") {
      return filtersSource();
    }
    return filtersSource ?? {};
  });

  const queryParams = computed(() => ({
    page: 1,
    limit: 10,
    isPublished: true,
    search: filters.value.search?.trim(),
    tags: filters.value.tags,
  }));

  const cacheKey = computed(
    () => `workspace-tests-${JSON.stringify(queryParams.value)}`
  );

  const { data, pending, error, refresh } = useAsyncData(
    cacheKey,
    async () => {
      const result = await getTests(queryParams.value);
      return result;
    },
    {
      immediate: options?.immediate ?? true,
      watch: [queryParams],
      getCachedData: (key, nuxtApp) => {
        const cached = nuxtApp.payload.data[key];
        if (cached) {
          return cached;
        }
        return undefined;
      },
    }
  );

  // Локальное состояние для тестов (как в useQuestionsDisplay)
  const tests = ref<WorkspaceTest[]>([]);

  // Функция нормализации тега
  const normalizeTag = (tag: TestsResponseTag) => ({
    id: tag.id,
    name: tag.name,
    category: tag.category
      ? {
          id: tag.category.id,
          name: tag.category.name,
          color: tag.category.color,
        }
      : null,
  });

  // Функция нормализации теста
  const normalizeTest = (test: TestsResponseTest): WorkspaceTest => {
    const primaryTag = test.primaryTag ? normalizeTag(test.primaryTag) : null;
    const mappedTags = (test.tags ?? []).map(normalizeTag);
    const tagsWithPrimary =
      primaryTag && !mappedTags.some((tag) => tag.id === primaryTag.id)
        ? [primaryTag, ...mappedTags]
        : mappedTags;

    return {
      id: test.id,
      title: test.name,
      description: test.description ?? "",
      questionsCount: test.questionCount,
      questionIds: test.questionIds ?? [],
      isPublished: Boolean(test.isPublished),
      tags: tagsWithPrimary,
      isFavorite: test.isFavorite ?? false,
    };
  };

  // Синхронизируем данные из useAsyncData с локальным состоянием
  watch(
    data,
    (newData) => {
      if (newData?.tests) {
        tests.value = newData.tests.map(normalizeTest);
      }
    },
    { immediate: true }
  );

  const togglingFavorite = ref(false);

  const handleToggleBookmark = async (testId: number) => {
    if (togglingFavorite.value) return;

    const test = tests.value.find((t) => t.id === testId);
    if (!test) return;

    const wasFavorite = test.isFavorite ?? false;
    test.isFavorite = !wasFavorite;

    try {
      togglingFavorite.value = true;
      const result = await toggleFavorite(testId);

      test.isFavorite = result.isFavorite;

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: result.message,
        life: 3000,
      });

      await clearNuxtData(cacheKey.value);
    } catch (err) {
      test.isFavorite = wasFavorite;

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

  return {
    tests: computed(() => tests.value),
    pending,
    error,
    refresh,
    handleToggleBookmark,
  };
}
