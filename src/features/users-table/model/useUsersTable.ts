import { computed, watch, type Ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { User, UsersTableFilters } from "./types";

export const getSubscriptionLabel = (user: User): string => {
  if (user.isLifetimeAccess || user.subscriptionType === "LIFETIME") {
    return "Пожизненный";
  }

  switch (user.subscriptionType) {
    case "PREMIUM_MONTHLY":
      return "Премиум (месячная)";
    case "PREMIUM_YEARLY":
      return "Премиум (годовая)";
    case "FREE":
    default:
      return "Бесплатный";
  }
};

export const getSubscriptionSeverity = (user: User): string => {
  if (user.isLifetimeAccess || user.subscriptionType === "LIFETIME") {
    return "success";
  }

  if (
    user.subscriptionType === "PREMIUM_MONTHLY" ||
    user.subscriptionType === "PREMIUM_YEARLY"
  ) {
    // Проверяем, не истекла ли подписка
    if (
      user.subscriptionEndsAt &&
      new Date(user.subscriptionEndsAt) > new Date()
    ) {
      return "info";
    } else {
      return "warning"; // Истекшая подписка
    }
  }

  return "secondary"; // Бесплатный
};

export function useUsersTable(filters: Ref<UsersTableFilters>) {
  const toast = useToastClient();

  const queryParams = computed(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
    search: filters.value.search?.trim() || undefined,
    role: filters.value.role || undefined,
    status:
      filters.value.status !== undefined ? filters.value.status : undefined,
  }));

  const cacheKey = computed(
    () => `admin-users-${JSON.stringify(queryParams.value)}`,
  );

  const {
    data: usersData,
    pending: loading,
    error,
    refresh: refreshUsers,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await trpc.users.getList.query({
        page: queryParams.value.page,
        limit: queryParams.value.limit,
        search: queryParams.value.search,
        role: queryParams.value.role,
        status: queryParams.value.status,
      });

      return {
        users: response.users as User[],
        pagination: response.pagination,
      };
    },
    {
      immediate: true,
      watch: [queryParams],
      getCachedData: (key, nuxtApp) => {
        const cached = nuxtApp.payload.data[key];
        if (cached) {
          return cached;
        }
        return undefined;
      },
    },
  );

  const users = computed(() => usersData.value?.users ?? []);
  const pagination = computed(
    () =>
      usersData.value?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
  );

  watch(error, (err) => {
    if (err) {
      console.error("Ошибка при загрузке пользователей:", err);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить пользователей",
      });
    }
  });

  const refresh = async () => {
    await clearNuxtData(cacheKey.value);
    await refreshUsers();
  };

  return {
    users,
    pagination,
    loading,
    refresh,
    cacheKey,
  };
}
