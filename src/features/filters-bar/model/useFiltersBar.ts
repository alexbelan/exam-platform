import { computed, type Ref } from "vue";
import type { FiltersBarFilters } from "./types";

export function useFiltersBar(
  filters: Ref<FiltersBarFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const selectedTags = computed({
    get: () => filters.value.tags || [],
    set: (value: string[]) => {
      // Всегда создаем новый массив для гарантии реактивности
      // Это позволяет корректно удалять последний тег
      const newTags = Array.isArray(value) ? [...value] : [];
      filters.value = { ...filters.value, tags: newTags };
    },
  });

  const hasActiveFilters = computed(() => {
    return Boolean(search.value.trim()) || (selectedTags.value && selectedTags.value.length > 0);
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    selectedTags,
    hasActiveFilters,
    reset,
  };
}

