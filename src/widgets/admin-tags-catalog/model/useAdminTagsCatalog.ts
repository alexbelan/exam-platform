import { computed, ref, onMounted, reactive } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useConfirm } from "primevue/useconfirm";
import { useAdminTagsTable } from "@features/admin-tags-table/model/useAdminTagsTable";
import type { AdminTagsCatalogFilters } from "./types";
import type { Tag, AdminTagsTableFilters } from "@features/admin-tags-table";
import type { CategoryEntity } from "@entities/category";

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export function useAdminTagsCatalog(
  emit: {
    (event: "create"): void;
    (event: "edit", tag: Tag): void;
    (event: "delete", tag: Tag): void;
  }
) {
  const toast = useToastClient();
  const confirm = useConfirm();

  const filters = ref<AdminTagsCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const categories = ref<CategoryEntity[]>([]);
  const categoriesLoading = ref(false);

  const tableFilters = computed<AdminTagsTableFilters>(() => ({
    search: filters.value.search,
    categoryId: filters.value.categoryId,
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  const {
    tags,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    refresh,
    cacheKey,
  } = useAdminTagsTable(tableFilters, (event: { page: number; rows: number }) => {
    filters.value.page = event.page + 1;
    filters.value.limit = event.rows;
  });

  const tagModal = reactive({
    visible: false,
    saving: false,
    tag: null as Tag | null,
  });

  const categoryOptions = computed<CategoryEntity[]>(() =>
    categories.value.map(({ id, name, slug, color }) => ({
      id,
      name,
      slug,
      color,
    }))
  );

  const fetchCategories = async () => {
    categoriesLoading.value = true;
    try {
      const response = await trpc.tagCategories.getList.query({
        page: 1,
        limit: 100,
      });
      categories.value = response.categories as CategoryEntity[];
      if (
        filters.value.categoryId !== undefined &&
        !categories.value.some(
          (category) => category.id === filters.value.categoryId
        )
      ) {
        filters.value.categoryId = undefined;
      }
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(error, "Не удалось загрузить категории"),
      });
    } finally {
      categoriesLoading.value = false;
    }
  };

  const refreshData = async () => {
    await clearNuxtData(cacheKey.value);
    await Promise.all([fetchCategories(), refresh()]);
  };

  const openTagModal = (tag?: Tag | null) => {
    if (tag) {
      emit("edit", tag);
    } else {
      emit("create");
    }
  };

  const handleDelete = async (tag: Tag) => {
    confirm.require({
      header: "Удаление тега",
      message: `Удалить тег "${tag.name}"?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Удалить",
      rejectLabel: "Отмена",
      acceptClass: "p-button-danger",
      accept: async () => {
        try {
          await trpc.tags.delete.mutate({ id: tag.id.toString() });

          toast.add({
            severity: "success",
            summary: "Успешно",
            detail: `Тег "${tag.name}" удален`,
          });

          await clearNuxtData(cacheKey.value);
          await refresh();

          emit("delete", tag);
        } catch (error) {
          console.error("Ошибка при удалении тега:", error);
          toast.add({
            severity: "error",
            summary: "Ошибка",
            detail: extractErrorMessage(error, "Не удалось удалить тег"),
          });
        }
      },
    });
  };

  const handleFiltersUpdate = (newFilters: { search?: string; categoryId?: number | null }) => {
    filters.value = {
      ...filters.value,
      search: newFilters.search,
      categoryId: newFilters.categoryId ?? undefined,
    };
    filters.value.page = 1;
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  onMounted(() => {
    refreshData();
  });

  return {
    filters,
    tableFilters,
    tags,
    pagination,
    loading: computed(() => loading.value || categoriesLoading.value),
    columns,
    categories,
    categoriesLoading,
    categoryOptions,
    handlePageChange: handleTablePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
    openTagModal,
    handleDelete,
    refreshData,
  };
}

