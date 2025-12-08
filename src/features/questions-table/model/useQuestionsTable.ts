import { computed, watch, type Ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { TableColumn, PageEvent } from "@shared/ui/Table";
import { normalizeHex, getContrastColor } from "@shared/utils/color";
import type { Question, QuestionsTableFilters, Tag } from "./types";

const defaultCategoryColor = "#3b82f6";

export const getTagStyles = (tag: Tag) => {
  const color = normalizeHex(tag.category?.color || "") || defaultCategoryColor;
  return {
    backgroundColor: color,
    borderColor: color,
    color: getContrastColor(color, defaultCategoryColor),
  };
};

export function useQuestionsTable(
  filters: Ref<QuestionsTableFilters>,
  onPageChange: (event: { page: number; rows: number }) => void,
) {
  const toast = useToastClient();

  const queryParams = computed(() => ({
    page: filters.value.page,
    limit: filters.value.limit,
    search: filters.value.search?.trim() || undefined,
    status:
      filters.value.status !== undefined ? filters.value.status : undefined,
  }));

  const cacheKey = computed(
    () => `admin-questions-${JSON.stringify(queryParams.value)}`,
  );

  const {
    data: questionsData,
    pending: loading,
    error,
    refresh: refreshQuestions,
  } = useAsyncData(
    cacheKey,
    async () => {
      const response = await trpc.questions.getList.query({
        page: queryParams.value.page,
        limit: queryParams.value.limit,
        search: queryParams.value.search,
        status: queryParams.value.status,
      });

      return {
        questions: response.questions as Question[],
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

  const questions = computed(() => questionsData.value?.questions ?? []);
  const pagination = computed(
    () =>
      questionsData.value?.pagination ?? {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
  );

  watch(error, (err) => {
    if (err) {
      console.error("Ошибка при загрузке вопросов:", err);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить вопросы",
      });
    }
  });

  const columns: TableColumn<Question>[] = [
    {
      field: "id",
      header: "ID",
      sortable: true,
      style: "min-width: 200px",
    },
    {
      field: "title",
      header: "Заголовок",
      sortable: true,
    },
    {
      field: "isPublished",
      header: "Статус",
      sortable: true,
    },
    {
      field: "createdAt",
      header: "Дата создания",
      sortable: true,
    },
  ];

  const handlePageChange = (event: PageEvent) => {
    onPageChange({ page: event.page, rows: event.rows });
  };

  const refresh = async () => {
    await clearNuxtData(cacheKey.value);
    await refreshQuestions();
  };

  return {
    questions,
    pagination,
    loading,
    columns,
    handlePageChange,
    refresh,
    cacheKey,
  };
}
