import { computed, type Ref } from "vue";
import type { AdminTestsFilters } from "./types";

export function useAdminTestsFilters(
  filters: Ref<AdminTestsFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const hasActiveFilters = computed(() => {
    return Boolean(search.value.trim());
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    hasActiveFilters,
    reset,
  };
}

