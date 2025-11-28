import { computed, ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useUsersTable } from "@features/users-table/model/useUsersTable";
import type { AdminUsersCatalogFilters } from "./types";
import type { User, UsersTableFilters } from "@features/users-table";

export function useAdminUsersCatalog(
  emit: {
    (event: "create"): void;
    (event: "view", user: User): void;
    (event: "edit", user: User): void;
    (event: "delete", user: User): void;
  }
) {
  const toast = useToastClient();

  const filters = ref<AdminUsersCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const tableFilters = computed<UsersTableFilters>(() => ({
    search: filters.value.search,
    role: filters.value.role,
    status: filters.value.status,
    subscription: filters.value.subscription,
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  const {
    users,
    pagination,
    loading,
    refresh,
    cacheKey,
  } = useUsersTable(tableFilters, (event: { page: number; rows: number }) => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
  });

  const handleView = async (user: User) => {
    try {
      const response = await trpc.users.getById.query({ id: user.id.toString() });
      console.log("Детали пользователя:", response.user);
      emit("view", user);
    } catch (error) {
      console.error("Ошибка при получении пользователя:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось получить данные пользователя",
      });
    }
  };

  const handleDelete = async (user: User) => {
    if (
      confirm(
        `Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        await trpc.users.delete.mutate({ id: user.id.toString() });

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Пользователь удален",
        });

        await clearNuxtData(cacheKey.value);
        await refresh();

        emit("delete", user);
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail: "Не удалось удалить пользователя",
        });
      }
    }
  };

  const handleFiltersUpdate = (newFilters: {
    search?: string;
    role?: string | null;
    status?: boolean | null;
    subscription?: string | null;
  }) => {
    filters.value = {
      ...filters.value,
      search: newFilters.search,
      role: newFilters.role ?? undefined,
      status: newFilters.status ?? undefined,
      subscription: newFilters.subscription ?? undefined,
    };
    filters.value.page = 1;
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  const exportUsers = () => {
    console.log("Экспорт пользователей");
    // TODO: реализовать экспорт в CSV/Excel
  };

  return {
    filters,
    users,
    pagination,
    loading,
    handleView,
    handleDelete,
    handleFiltersUpdate,
    handleFiltersReset,
    exportUsers,
    refresh,
  };
}

