import { computed, ref, watch } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import { useQuestionsTable } from "@features/questions-table/model/useQuestionsTable";
import type { AdminQuestionsCatalogFilters } from "./types";
import type { Question, QuestionsTableFilters } from "@features/questions-table";

export function useAdminQuestionsCatalog(
  emit: {
    (event: "open", id: number): void;
    (event: "create"): void;
    (event: "import"): void;
    (event: "view", question: Question): void;
    (event: "toggle-publish", question: Question): void;
    (event: "delete", question: Question): void;
  }
) {
  const toast = useToastClient();

  const filters = ref<AdminQuestionsCatalogFilters>({
    page: 1,
    limit: 10,
  });

  const tableFilters = computed<QuestionsTableFilters>(() => ({
    search: filters.value.search,
    status: filters.value.status,
    page: filters.value.page,
    limit: filters.value.limit,
  }));

  // Используем composable для загрузки данных
  const {
    questions,
    pagination,
    loading,
    columns,
    handlePageChange: handleTablePageChange,
    refresh,
    cacheKey,
  } = useQuestionsTable(tableFilters, (event: { page: number; rows: number }) => {
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


  const handleFiltersUpdate = (newFilters: { search?: string; status?: boolean | null }) => {
    filters.value = { 
      ...filters.value, 
      search: newFilters.search,
      status: newFilters.status ?? undefined,
    };
    filters.value.page = 1; // Сброс на первую страницу при изменении фильтров
  };

  const handleFiltersReset = () => {
    filters.value = {
      page: 1,
      limit: filters.value.limit,
    };
  };

  return {
    filters,
    tableFilters,
    questions,
    pagination,
    loading,
    columns,
    handleView,
    handleTogglePublish,
    handleDelete,
    handlePageChange: handleTablePageChange,
    handleFiltersUpdate,
    handleFiltersReset,
  };
}

