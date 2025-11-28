import { computed, ref, onMounted } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useTestsTable } from "@features/tests-table/model/useTestsTable";
import type { AdminTestsCatalogFilters } from "./types";
import type { Test, TestsTableFilters } from "@features/tests-table";
import type { TestTagOption } from "@features/test-modal";

export function useAdminTestsCatalog(
  emit: {
    (event: "create"): void;
    (event: "edit", test: Test): void;
    (event: "delete", test: Test): void;
  }
) {
  const toast = useToastClient();

  const filters = ref<AdminTestsCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const tagOptions = ref<TestTagOption[]>([]);
  const tagsLoading = ref(false);

  const tableFilters = computed<TestsTableFilters>(() => ({
    search: filters.value.search,
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  const {
    tests,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    refresh,
    cacheKey,
  } = useTestsTable(tableFilters, (event: { page: number; rows: number }) => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
  });

  const fetchTags = async () => {
    tagsLoading.value = true;
    try {
      const response = await trpc.tags.getList.query({
        page: 1,
        limit: 100, // Загружаем все теги для выбора
      });
      tagOptions.value = response.tags as TestTagOption[];
    } catch (error) {
      console.error("Ошибка при загрузке тегов:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить теги",
      });
    } finally {
      tagsLoading.value = false;
    }
  };

  const handleDelete = async (test: Test) => {
    if (!confirm(`Вы уверены, что хотите удалить тест "${test.name}"?`)) {
      return;
    }

    try {
      await trpc.tests.delete.mutate({ id: test.id });

      toast.add({
        severity: "success",
        summary: "Удалено",
        detail: "Тест удалён",
      });

      await clearNuxtData(cacheKey.value);
      await refresh();

      emit("delete", test);
    } catch (error) {
      console.error("Ошибка при удалении теста:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить тест",
      });
    }
  };

  const handleFiltersUpdate = (newFilters: { search?: string }) => {
    filters.value = {
      ...filters.value,
      search: newFilters.search,
    };
    filters.value.page = 1; // Сброс на первую страницу при изменении фильтров
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  onMounted(async () => {
    await fetchTags();
  });

  return {
    filters,
    tableFilters,
    tests,
    pagination,
    loading,
    columns,
    tagOptions,
    tagsLoading,
    handlePageChange: handleTablePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
    handleDelete,
    refresh,
  };
}

