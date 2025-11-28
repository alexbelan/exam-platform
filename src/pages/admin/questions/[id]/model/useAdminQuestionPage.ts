import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";

export function useAdminQuestionPage(questionId: string) {
  const toast = useToastClient();

  const handleSave = async (data: {
    title: string;
    content: string;
    isPublished: boolean;
    requiresPremium: boolean;
    categoryId?: number | null;
    tags: string[];
    answers: Array<{ id: string; isCorrect: boolean }>;
  }) => {
    const isNew = questionId === "new";

    try {
      const payload = {
        title: data.title,
        content: data.content,
        isPublished: data.isPublished,
        requiresPremium: data.requiresPremium,
        categoryId: data.categoryId?.toString(),
        tags: data.tags,
        answers: data.answers,
      };

      if (isNew) {
        await trpc.questions.create.mutate(payload);
        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Вопрос создан",
        });
      } else {
        await trpc.questions.update.mutate({
          id: Number(questionId),
          ...payload,
        });
        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Вопрос обновлен",
        });
      }

      navigateTo("/admin/questions");
    } catch (error) {
      console.error("Ошибка при сохранении вопроса:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: isNew
          ? "Не удалось создать вопрос"
          : "Не удалось обновить вопрос",
      });
    }
  };

  const handleCancel = () => {
    navigateTo("/admin/questions");
  };

  return {
    handleSave,
    handleCancel,
  };
}

