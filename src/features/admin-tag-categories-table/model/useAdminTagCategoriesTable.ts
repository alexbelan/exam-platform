import { computed, watch, type Ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { normalizeHex } from "@shared/utils/color";
import { TAG_CATEGORY_DEFAULT_COLOR } from "@features/admin-tag-category-modal/model/useAdminTagCategoryModal";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import type {
  CategoryTableItem,
  AdminTagCategoriesTableFilters,
} from "./types";
import type { CategoryEntity } from "@entities/category";

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export const getCategoryColor = (category?: CategoryEntity | null) =>
  normalizeHex(category?.color) || TAG_CATEGORY_DEFAULT_COLOR;

export function useAdminTagCategoriesTable(
  filters: Ref<AdminTagCategoriesTableFilters>,
  onPageChange: (event: { page: number; rows: number }) => void
) {
  const toast = useToastClient();

  const queryParams = computed(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  const cacheKey = computed(
    () => `admin-tag-categories-${JSON.stringify(queryParams.value)}`
  );

  const {
    data: categoriesData,
    pending: loading,
    error,
    refresh: refreshCategories,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await trpc.tagCategories.getList.query({
        page: queryParams.value.page,
        limit: queryParams.value.limit,
      });

      const processedCategories = response.categories.map(
        (category: CategoryEntity & { _count?: { tags: number } }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          tagCount: (category as any)._count?.tags ?? 0,
        })
      );

      return {
        categories: processedCategories as CategoryTableItem[],
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
    }
  );

  const categories = computed(() => categoriesData.value?.categories ?? []);
  const pagination = computed(
    () =>
      categoriesData.value?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      }
  );

  watch(error, (err) => {
    if (err) {
      console.error("Ошибка при загрузке категорий:", err);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(err, "Не удалось загрузить категории"),
      });
    }
  });

  const columns: TableColumn<CategoryTableItem>[] = [
    {
      field: "name",
      header: "Название",
      sortable: true,
    },
    {
      field: "slug",
      header: "Slug",
      sortable: true,
    },
    {
      field: "tagCount",
      header: "Количество тегов",
      sortable: true,
      style: "width: 160px; text-align: center;",
    },
  ];

  const handlePageChange = (event: PageEvent) => {
    onPageChange({ page: event.page, rows: event.rows });
  };

  const refresh = async () => {
    await clearNuxtData(cacheKey.value);
    await refreshCategories();
  };

  return {
    categories,
    pagination,
    loading,
    columns,
    handlePageChange,
    refresh,
    cacheKey,
  };
}

