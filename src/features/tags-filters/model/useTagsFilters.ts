import { computed, type Ref } from "vue";
import type { TagsFilters } from "./types";

export function useTagsFilters(
  filters: Ref<TagsFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const categoryId = computed({
    get: () => filters.value.categoryId ?? null,
    set: (value: number | null) => {
      filters.value = { ...filters.value, categoryId: value ?? undefined };
    },
  });

  const hasActiveFilters = computed(() => {
    return Boolean(search.value.trim()) || categoryId.value !== null;
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    categoryId,
    hasActiveFilters,
    reset,
  };
}

