import { computed, ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useConfirm } from "primevue/useconfirm";
import { useCategoriesTable } from "@features/categories-table/model/useCategoriesTable";
import type { AdminTagCategoriesCatalogFilters } from "./types";
import type { CategoryTableItem, CategoriesTableFilters } from "@features/categories-table";

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export function useAdminTagCategoriesCatalog(
  emit: {
    (event: "create", data: { name: string; color: string }): void;
    (event: "edit", category: CategoryTableItem): void;
    (event: "delete", category: CategoryTableItem): void;
  }
) {
  const toast = useToastClient();
  const confirm = useConfirm();

  const filters = ref<AdminTagCategoriesCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const tableFilters = computed<CategoriesTableFilters>(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  const {
    categories,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    refresh,
    cacheKey,
  } = useCategoriesTable(tableFilters, (event: { page: number; rows: number }) => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
  });

  const fetchCategories = async () => {
    await clearNuxtData(cacheKey.value);
    await refresh();
  };

  const handleCreate = async (data: { name: string; color: string }) => {
    try {
      await trpc.tagCategories.create.mutate({
        name: data.name,
        color: data.color,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Категория создана",
      });

      await fetchCategories();
      emit("create", data);
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(error, "Не удалось создать категорию"),
      });
      throw error;
    }
  };

  const handleDelete = async (category: CategoryTableItem) => {
    confirm.require({
      header: "Удаление категории",
      message: `Удалить категорию "${category.name}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      acceptClass: "p-button-danger",
      accept: async () => {
        try {
          await trpc.tagCategories.delete.mutate({ id: category.id.toString() });

          toast.add({
            severity: "success",
            summary: "Успешно",
            detail: `Категория "${category.name}" удалена`,
          });

          await fetchCategories();
          emit("delete", category);
        } catch (error) {
          console.error("Ошибка при удалении категории:", error);
          toast.add({
            severity: "error",
            summary: "Ошибка",
            detail: extractErrorMessage(
              error,
              "Не удалось удалить категорию. Убедитесь, что в ней нет тегов."
            ),
          });
        }
      },
    });
  };

  return {
    filters,
    categories,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    handleCreate,
    handleDelete,
    fetchCategories,
  };
}

