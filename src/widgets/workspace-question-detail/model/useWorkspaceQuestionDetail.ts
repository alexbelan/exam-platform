import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAsyncWorkspaceQuestionDetail } from "./useAsyncWorkspaceQuestionDetail";
import { useAsyncQuestionsDisplay } from "@features/questions-display/model/useAsyncQuestionsDisplay";
import { useToastClient } from "@shared/hooks/useToastClient";

export function useWorkspaceQuestionDetail(
  questionId: number | (() => number)
) {
  const router = useRouter();
  const { question, pending, error, refresh } =
    useAsyncWorkspaceQuestionDetail(questionId);
  const { toggleFavorite } = useAsyncQuestionsDisplay();
  const toast = useToastClient();
  const togglingFavorite = ref(false);

  const handleToggleBookmark = async () => {
    if (!question.value || togglingFavorite.value) return;

    const questionIdValue =
      typeof questionId === "function" ? questionId() : questionId;

    // Оптимистичное обновление UI
    const wasFavorite = question.value.isFavorite ?? false;
    if (question.value) {
      question.value.isFavorite = !wasFavorite;
    }

    try {
      togglingFavorite.value = true;
      const result = await toggleFavorite(questionIdValue);

      // Синхронизируем с ответом сервера
      if (question.value) {
        question.value.isFavorite = result.isFavorite;
      }

      // Показываем уведомление
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: result.message,
        life: 3000,
      });
    } catch (err) {
      if (question.value) {
        question.value.isFavorite = wasFavorite;
      }

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail:
          err instanceof Error ? err.message : "Не удалось обновить избранное",
        life: 3000,
      });
    } finally {
      togglingFavorite.value = false;
    }
  };

  const goBack = () => {
    router.back();
  };

  return {
    question,
    pending,
    error,
    refresh,
    togglingFavorite,
    handleToggleBookmark,
    goBack,
  };
}
