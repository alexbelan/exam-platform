import { computed, type Ref } from "vue";
import type { SubmissionsFilters } from "./types";

export function useSubmissionsFilters(
  filters: Ref<SubmissionsFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const status = computed({
    get: () => filters.value.status ?? null,
    set: (value: string | null) => {
      filters.value = { ...filters.value, status: value ?? undefined };
    },
  });

  const date = computed({
    get: () => filters.value.date ?? null,
    set: (value: Date | null) => {
      filters.value = { ...filters.value, date: value ?? undefined };
    },
  });

  const statusOptions = [
    { label: "Ожидает", value: "PENDING" },
    { label: "Одобрена", value: "APPROVED" },
    { label: "Отклонена", value: "REJECTED" },
    { label: "Требует доработки", value: "NEEDS_REVISION" },
  ];

  const hasActiveFilters = computed(() => {
    return (
      Boolean(search.value.trim()) ||
      status.value !== null ||
      date.value !== null
    );
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    status,
    date,
    statusOptions,
    hasActiveFilters,
    reset,
  };
}

