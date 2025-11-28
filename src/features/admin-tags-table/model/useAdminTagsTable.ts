import { computed, watch, type Ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import { normalizeHex, getContrastColor } from "@shared/utils/color";
import { TAG_CATEGORY_DEFAULT_COLOR } from "@features/admin-tag-category-modal/model/useAdminTagCategoryModal";
import type { Tag, AdminTagsTableFilters, TagUtils } from "./types";
import type { CategoryEntity } from "@entities/category";

const getCategoryColor = (category?: CategoryEntity | null) =>
  normalizeHex(category?.color || "") || TAG_CATEGORY_DEFAULT_COLOR;

export const getTagColor = (tag: Tag) =>
  normalizeHex(tag.category?.color || "") || TAG_CATEGORY_DEFAULT_COLOR;

export const getTagChipStyle = (
  category?: CategoryEntity | null
): Record<string, string> => {
  const color = getCategoryColor(category);
  return {
    backgroundColor: color,
    borderColor: color,
    color: getContrastColor(color, TAG_CATEGORY_DEFAULT_COLOR),
  };
};

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export function useAdminTagsTable(
  filters: Ref<AdminTagsTableFilters>,
  onPageChange: (event: { page: number; rows: number }) => void
) {
  const toast = useToastClient();

  const queryParams = computed(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
    search: filters.value.search?.trim() || undefined,
    categoryId: filters.value.categoryId?.toString(),
  }));

  const cacheKey = computed(
    () => `admin-tags-${JSON.stringify(queryParams.value)}`
  );

  const {
    data: tagsData,
    pending: loading,
    error,
    refresh: refreshTags,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await trpc.tags.getList.query({
        page: queryParams.value.page,
        limit: queryParams.value.limit,
        search: queryParams.value.search,
        categoryId: queryParams.value.categoryId,
      });

      return {
        tags: response.tags as Tag[],
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

  const tags = computed(() => tagsData.value?.tags ?? []);
  const pagination = computed(
    () =>
      tagsData.value?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      }
  );

  watch(error, (err) => {
    if (err) {
      console.error("Ошибка при загрузке тегов:", err);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(err, "Не удалось загрузить теги"),
      });
    }
  });

  const columns: TableColumn<Tag>[] = [
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
      field: "category.name",
      header: "Категория",
      sortable: true,
    },
  ];

  const handlePageChange = (event: PageEvent) => {
    onPageChange({ page: event.page, rows: event.rows });
  };

  const refresh = async () => {
    await clearNuxtData(cacheKey.value);
    await refreshTags();
  };

  return {
    tags,
    pagination,
    loading,
    columns,
    handlePageChange,
    refresh,
    cacheKey,
  };
}
