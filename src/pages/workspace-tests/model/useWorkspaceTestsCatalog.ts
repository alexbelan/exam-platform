import { computed, ref } from "vue";
import type { WorkspaceTestsCatalogFilters } from "./types";

export function useWorkspaceTestsCatalog(emitStartTest: (id: number) => void) {
  const search = ref("");
  const selectedTags = ref<string[]>([]);

  const filters = computed<WorkspaceTestsCatalogFilters>(() => ({
    search: search.value.trim() || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  }));

  const hasActiveFilters = computed(
    () => Boolean(search.value.trim()) || selectedTags.value.length > 0,
  );

  const resetFilters = () => {
    search.value = "";
    selectedTags.value = [];
  };

  const handleFiltersUpdate = (newFilters: {
    search?: string;
    tags?: string[];
  }) => {
    if (newFilters.search !== undefined) {
      search.value = newFilters.search;
    }
    // Обрабатываем tags: если это пустой массив, очищаем selectedTags
    if (newFilters.tags !== undefined) {
      selectedTags.value =
        Array.isArray(newFilters.tags) && newFilters.tags.length === 0
          ? []
          : newFilters.tags;
    }
  };

  const handleStartTest = (id: number) => {
    emitStartTest(id);
  };

  return {
    search,
    selectedTags,
    filters,
    hasActiveFilters,
    resetFilters,
    handleFiltersUpdate,
    handleStartTest,
  };
}
