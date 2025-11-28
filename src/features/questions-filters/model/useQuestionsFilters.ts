import { computed, type Ref } from "vue";
import type { QuestionsFilters } from "./types";

export function useQuestionsFilters(
  filters: Ref<QuestionsFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const status = computed({
    get: () => filters.value.status ?? null,
    set: (value: boolean | null) => {
      filters.value = { ...filters.value, status: value ?? undefined };
    },
  });

  const statusOptions = [
    { label: "Опубликован", value: true },
    { label: "Черновик", value: false },
  ];

  const hasActiveFilters = computed(() => {
    return Boolean(search.value.trim()) || status.value !== null;
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    status,
    statusOptions,
    hasActiveFilters,
    reset,
  };
}

