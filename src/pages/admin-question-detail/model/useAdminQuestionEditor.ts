import { ref, computed, onMounted } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { QuestionFormData, Tag } from "@features/question-form";
import type { QuestionAnswer } from "@features/question-answers";
import type { Question, AdminQuestionEditorEmits } from "./types";

export function useAdminQuestionEditor(
  questionId: string | number | null,
  emit: AdminQuestionEditorEmits,
) {
  const toast = useToastClient();

  const isNew = computed(() => questionId === "new" || questionId === null);

  const question = ref<Question | null>(null);
  const loading = ref(true);
  const saving = ref(false);

  const questionForm = ref<QuestionFormData>({
    title: "",
    content: "",
    isPublished: false,
    requiresPremium: false,
    categoryId: null,
  });

  const selectedTags = ref<Tag[]>([]);
  const questionAnswers = ref<QuestionAnswer[]>([]);

  const fetchQuestion = async () => {
    if (isNew.value) {
      loading.value = false;
      questionAnswers.value = [];
      return;
    }

    loading.value = true;
    try {
      const response = await trpc.questions.getById.query({
        id: Number(questionId),
      });
      if (!response.question) {
        throw new Error("Вопрос не найден");
      }
      question.value = response.question as Question;
      questionForm.value = {
        title: question.value.title,
        content: question.value.content,
        isPublished: question.value.isPublished,
        requiresPremium: question.value.requiresPremium ?? false,
        categoryId: question.value.categoryId ?? null,
      };
      selectedTags.value = question.value.tags || [];

      if (question.value.questionAnswers) {
        questionAnswers.value = question.value.questionAnswers.map((qa) => ({
          id: qa.id,
          answerId: qa.answer.id,
          answer: qa.answer,
          isCorrect: qa.isCorrect,
        }));
      } else {
        questionAnswers.value = [];
      }
    } catch (error) {
      console.error("Ошибка при загрузке вопроса:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить вопрос",
      });
      emit("cancel");
    } finally {
      loading.value = false;
    }
  };

  const getSaveData = () => {
    const answersPayload = questionAnswers.value.map((qa) => ({
      id: qa.answerId.toString(),
      isCorrect: qa.isCorrect,
    }));

    const tagsPayload = selectedTags.value
      .map((tag) => {
        if (tag && typeof tag === "object" && "id" in tag) {
          return String(tag.id);
        }
        if (typeof tag === "number") {
          return String(tag);
        }
        if (typeof tag === "string") {
          return tag;
        }
        return "";
      })
      .filter(Boolean);

    const categoryId = questionForm.value.categoryId
      ? questionForm.value.categoryId
      : undefined;

    return {
      title: questionForm.value.title,
      content: questionForm.value.content,
      isPublished: questionForm.value.isPublished,
      requiresPremium: questionForm.value.requiresPremium,
      categoryId,
      tags: tagsPayload,
      answers: answersPayload,
    };
  };

  const saveQuestion = async () => {
    if (!questionForm.value.title || !questionForm.value.content) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Заголовок и содержание обязательны",
      });
      return;
    }

    saving.value = true;
    try {
      emit("save", getSaveData());
    } finally {
      saving.value = false;
    }
  };

  onMounted(() => {
    fetchQuestion();
  });

  return {
    isNew,
    question,
    loading,
    saving,
    questionForm,
    selectedTags,
    questionAnswers,
    saveQuestion,
    getSaveData,
  };
}
