import { computed } from "vue";
import { useAsyncWorkspaceTestDisplay } from "./useAsyncWorkspaceTestDisplay";
import type { WorkspaceTestDisplayFilters } from "./types";
import type { WorkspaceTest } from "@entities/test-card";

interface UseWorkspaceTestDisplayOptions {
  filters?: WorkspaceTestDisplayFilters | (() => WorkspaceTestDisplayFilters);
  immediate?: boolean;
}

export function useWorkspaceTestDisplay(
  options?: UseWorkspaceTestDisplayOptions
) {
  const { getTests } = useAsyncWorkspaceTestDisplay();
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
