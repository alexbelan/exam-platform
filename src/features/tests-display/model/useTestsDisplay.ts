import { computed } from "vue";
import { useAsyncTestsDisplay } from "./useAsyncTestsDisplay";
import type { TestsDisplayFilters } from "./types";
import type { WorkspaceTest } from "@entities/test-card";

interface UseTestsDisplayOptions {
  filters?: TestsDisplayFilters | (() => TestsDisplayFilters);
  immediate?: boolean;
}

export function useTestsDisplay(options?: UseTestsDisplayOptions) {
  const { getTests } = useAsyncTestsDisplay();
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

  const { data, pending, error, refresh } = useAsyncData(
    () => `workspace-tests-${JSON.stringify(queryParams.value)}`,
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

  const tests = computed<WorkspaceTest[]>(() =>
    (data.value?.tests ?? []).map((test) => {
      const normalizeTag = (tag: (typeof test.tags)[number]) => ({
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
        primaryTag,
        tags: tagsWithPrimary,
      };
    })
  );

  return {
    tests,
    pending,
    error,
    refresh,
  };
}
