import { computed, ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useQuestionsTable } from "@features/questions-table/model/useQuestionsTable";
import type { AdminQuestionsCatalogFilters } from "./types";
import type {
  Question,
  QuestionsTableFilters,
} from "@features/questions-table";

export function useAdminQuestionsCatalog(emit: {
  (event: "open", id: number): void;
  (event: "create" | "import"): void;
  (event: "view" | "toggle-publish" | "delete", question: Question): void;
}) {
  const toast = useToastClient();

  const filters = ref<AdminQuestionsCatalogFilters>({
    page: 1,
    limit: 10,
    search: undefined as string | undefined,
    status: null,
  });

  const tableFilters = computed<QuestionsTableFilters>(() => ({
    search: filters.value.search,
    status: filters.value.status === null ? undefined : filters.value.status,
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  // Используем composable для загрузки данных
  const { questions, pagination, loading, columns, refresh, cacheKey } =
    useQuestionsTable(tableFilters, (event: { page: number; rows: number }) => {
      filters.value.page = event.page + 1;
      filters.value.limit = event.rows;
    });

  const handleView = (question: Question) => {
    emit("view", question);
  };

  const handleTogglePublish = async (question: Question) => {
    try {
      await trpc.questions.update.mutate({
        id: question.id,
        isPublished: !question.isPublished,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: question.isPublished
          ? "Вопрос снят с публикации"
          : "Вопрос опубликован",
      });

      // Обновляем данные после изменения
      await clearNuxtData(cacheKey.value);
      await refresh();

      emit("toggle-publish", question);
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось изменить статус вопроса",
      });
    }
  };

  const handleDelete = async (question: Question) => {
    if (confirm(`Вы уверены, что хотите удалить вопрос "${question.title}"?`)) {
      try {
        await trpc.questions.delete.mutate({ id: question.id });

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Вопрос удален",
        });

        // Обновляем данные после удаления
        await clearNuxtData(cacheKey.value);
        await refresh();

        emit("delete", question);
      } catch (error) {
        console.error("Ошибка при удалении вопроса:", error);
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail: "Не удалось удалить вопрос",
        });
      }
    }
  };

  const handleFiltersUpdate = (newFilters: {
    search?: string;
    status?: boolean | null;
  }) => {
    filters.value = {
      ...filters.value,
      search: newFilters.search,
      status: newFilters.status ?? undefined,
    };
    filters.value.page = 1;
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  const handlePageChange = (event: { page: number; rows: number }) => {
    filters.value.page = event.page;
    filters.value.limit = event.rows;
  };

  const filtersForComponent = computed(() => ({
    search: filters.value.search,
    status: filters.value.status === null ? undefined : filters.value.status,
  }));

  return {
    filters,
    filtersForComponent,
    tableFilters,
    questions,
    pagination,
    loading,
    columns,
    handleView,
    handleTogglePublish,
    handleDelete,
    handlePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
  };
}
