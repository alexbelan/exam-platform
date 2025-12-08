import { computed, ref } from "vue";
import type { WorkspaceQuestionsCatalogFilters } from "./types";

export function useWorkspaceQuestionsCatalog(emitOpen: (id: number) => void) {
  const search = ref("");
  const selectedLevel = ref<string | null>(null);
  const selectedTags = ref<string[]>([]);

  const filters = computed<WorkspaceQuestionsCatalogFilters>(() => ({
    search: search.value.trim() || undefined,
    level: selectedLevel.value || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  }));

  const hasActiveFilters = computed(
    () =>
      Boolean(search.value.trim()) ||
      Boolean(selectedLevel.value) ||
      selectedTags.value.length > 0,
  );

  const resetFilters = () => {
    search.value = "";
    selectedLevel.value = null;
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

  const handleOpen = (id: number) => {
    emitOpen(id);
  };

  return {
    search,
    selectedLevel,
    selectedTags,
    filters,
    hasActiveFilters,
    resetFilters,
    handleFiltersUpdate,
    handleOpen,
  };
}
