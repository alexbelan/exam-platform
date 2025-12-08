import { computed, ref, onMounted } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useConfirm } from "primevue/useconfirm";
import { useTagsTable } from "@features/tags-table/model/useTagsTable";
import { extractErrorMessage } from "@shared/utils";
import type { AdminTagsCatalogFilters } from "./types";
import type { Tag, TagsTableFilters } from "@features/tags-table";
import type { CategoryEntity } from "@entities/category";

export function useAdminTagsCatalog(emit: {
  (event: "create"): void;
  (event: "edit" | "delete", tag: Tag): void;
}) {
  const toast = useToastClient();
  const confirm = useConfirm();

  const filters = ref<AdminTagsCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const categories = ref<CategoryEntity[]>([]);
  const categoriesLoading = ref(false);

  const tableFilters = computed<TagsTableFilters>(() => {
    const f = filters.value;
    return {
      search: f.search,
      categoryId: f.categoryId,
      page: f.page,
      limit: f.limit,
    };
  });

  const { tags, pagination, loading, columns, refresh, cacheKey } =
    useTagsTable(tableFilters, (event: { page: number; rows: number }) => {
      filters.value.page = event.page + 1;
      filters.value.limit = event.rows;
    });

  const categoryOptions = computed<CategoryEntity[]>(() =>
    categories.value.map(({ id, name, slug, color }) => ({
      id,
      name,
      slug,
      color,
    })),
  );

  const fetchCategories = async () => {
    categoriesLoading.value = true;
    try {
      const response = await trpc.tagCategories.getList.query({
        page: 1,
        limit: 100,
      });
      categories.value = response.categories as CategoryEntity[];
      const currentCategoryId = filters.value.categoryId;
      if (
        currentCategoryId !== undefined &&
        !categories.value.some((category) => category.id === currentCategoryId)
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

  const handleFiltersUpdate = (newFilters: {
    search?: string;
    categoryId?: number | null;
  }) => {
    Object.assign(filters.value, {
      search: newFilters.search,
      categoryId: newFilters.categoryId ?? undefined,
      page: 1,
    });
  };

  const handleFiltersReset = () => {
    Object.assign(filters.value, {
      search: undefined,
      categoryId: undefined,
      page: 1,
    });
  };

  const handlePageChange = (event: { page: number; rows: number }) => {
    filters.value.page = event.page;
    filters.value.limit = event.rows;
  };

  const filtersForComponent = computed(() => {
    const f = filters.value;
    return {
      search: f.search,
      categoryId: f.categoryId,
    };
  });

  onMounted(() => {
    refreshData();
  });

  return {
    filters,
    filtersForComponent,
    tableFilters,
    tags,
    pagination,
    loading: computed(() => loading.value || categoriesLoading.value),
    columns,
    categories,
    categoriesLoading,
    categoryOptions,
    handlePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
    openTagModal,
    handleDelete,
    refreshData,
  };
}
