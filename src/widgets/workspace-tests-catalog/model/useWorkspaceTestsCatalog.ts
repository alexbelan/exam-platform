import { computed, ref } from "vue";
import type { WorkspaceTestsCatalogFilters } from "./types";

export function useWorkspaceTestsCatalog(
  emit: (event: "start-test", id: number) => void
) {
  const search = ref("");
  const selectedTags = ref<string[]>([]);

  const filters = computed<WorkspaceTestsCatalogFilters>(() => ({
    search: search.value.trim() || undefined,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  }));

  const hasActiveFilters = computed(
    () =>
      Boolean(search.value.trim()) || selectedTags.value.length > 0
  );

  const resetFilters = () => {
    search.value = "";
    selectedTags.value = [];
  };

  const handleStartTest = (id: number) => {
    emit("start-test", id);
  };

  return {
    search,
    selectedTags,
    filters,
    hasActiveFilters,
    resetFilters,
    handleStartTest,
  };
}

