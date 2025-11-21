import { computed } from "vue";
import type { TestsResponse, WorkspaceTestDisplayFilters } from "./types";
import type { WorkspaceTest } from "@entities/test-card";

interface UseWorkspaceTestDisplayOptions {
  filters?: WorkspaceTestDisplayFilters | (() => WorkspaceTestDisplayFilters);
  immediate?: boolean;
}

export function useWorkspaceTestDisplay(options?: UseWorkspaceTestDisplayOptions) {
  const filtersSource = options?.filters;
  const filters = computed(() => {
    if (typeof filtersSource === "function") {
      return filtersSource();
    }
    return filtersSource ?? {};
  });

  const queryParams = computed(() => {
    const params: Record<string, string> = {
      isPublished: "true",
    };
    
    if (filters.value.search?.trim()) {
      params.search = filters.value.search.trim();
    }
    
    if (filters.value.tags && filters.value.tags.length > 0) {
      params.tags = filters.value.tags.join(",");
    }
    
    return params;
  });

  const { data, pending, error, refresh } = useAsyncData(
    () => `workspace-tests-${JSON.stringify(queryParams.value)}`,
    () =>
      $fetch<TestsResponse>("/api/tests", {
        query: queryParams.value,
      }),
    { 
      immediate: options?.immediate ?? true,
      watch: [queryParams],
    }
  );

  const tests = computed<WorkspaceTest[]>(() =>
    (data.value?.tests ?? []).map((test) => {
      const normalizeTag = (
        tag: NonNullable<TestsResponse["tests"][number]["tags"]>[number]
      ) => ({
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

