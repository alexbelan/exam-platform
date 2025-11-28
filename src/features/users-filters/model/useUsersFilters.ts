import { computed, type Ref } from "vue";
import type { UsersFilters } from "./types";

export function useUsersFilters(
  filters: Ref<UsersFilters>
) {
  const search = computed({
    get: () => filters.value.search || "",
    set: (value: string) => {
      filters.value = { ...filters.value, search: value || undefined };
    },
  });

  const role = computed({
    get: () => filters.value.role ?? null,
    set: (value: string | null) => {
      filters.value = { ...filters.value, role: value ?? undefined };
    },
  });

  const status = computed({
    get: () => filters.value.status ?? null,
    set: (value: boolean | null) => {
      filters.value = { ...filters.value, status: value ?? undefined };
    },
  });

  const subscription = computed({
    get: () => filters.value.subscription ?? null,
    set: (value: string | null) => {
      filters.value = { ...filters.value, subscription: value ?? undefined };
    },
  });

  const statusOptions = [
    { label: "Активен", value: true },
    { label: "Заблокирован", value: false },
  ];

  const subscriptionOptions = [
    { label: "Бесплатный", value: "FREE" },
    { label: "Премиум (месячная)", value: "PREMIUM_MONTHLY" },
    { label: "Премиум (годовая)", value: "PREMIUM_YEARLY" },
    { label: "Пожизненный", value: "LIFETIME" },
  ];

  const roleOptions = [
    { label: "Пользователь", value: "USER" },
    { label: "Администратор", value: "ADMIN" },
  ];

  const hasActiveFilters = computed(() => {
    return (
      Boolean(search.value.trim()) ||
      role.value !== null ||
      status.value !== null ||
      subscription.value !== null
    );
  });

  const reset = () => {
    filters.value = {};
  };

  return {
    search,
    role,
    status,
    subscription,
    statusOptions,
    subscriptionOptions,
    roleOptions,
    hasActiveFilters,
    reset,
  };
}

