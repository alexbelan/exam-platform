import { ref, computed } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { Answer, QuestionAnswer } from "./types";

export function useQuestionAnswers(
  questionAnswers: Ref<QuestionAnswer[]>,
  emit: {
    (event: "update:answers", answers: QuestionAnswer[]): void;
    (event: "add", answer: Answer): void;
    (event: "remove", questionAnswer: QuestionAnswer): void;
    (event: "toggle-correct", questionAnswer: QuestionAnswer): void;
  }
) {
  const toast = useToastClient();

  const answerInput = ref<Answer | string | null>(null);
  const answerSuggestions = ref<Answer[]>([]);
  const answersLoading = ref(false);
  const answerSearchTerm = ref("");

  const canCreateAnswer = computed(() => {
    const value = answerInput.value;
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return answerSearchTerm.value.trim().length > 0;
  });

  const searchAnswers = async (query: string): Promise<Answer[]> => {
    try {
      const response = await trpc.answers.getList.query({
        search: query,
      });
      const answers = response.answers || [];
      const existingAnswerIds = questionAnswers.value.map((qa) => qa.answerId);
      return answers.filter(
        (a: Answer) => !existingAnswerIds.includes(a.id)
      ) as Answer[];
    } catch (error) {
      console.error("Ошибка при поиске ответов:", error);
      return [];
    }
  };

  const addAnswerToQuestion = (answer: Answer) => {
    const exists = questionAnswers.value.some((qa) => qa.answerId === answer.id);

    if (exists) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Этот ответ уже добавлен",
      });
      return;
    }

    const newAnswers = [
      ...questionAnswers.value,
      {
        id: `temp-${Date.now()}`,
        answerId: answer.id,
        answer,
        isCorrect: false,
      },
    ];

    emit("update:answers", newAnswers);
    answerInput.value = null;
    answerSearchTerm.value = "";
    answerSuggestions.value = [];
  };

  const onAnswerComplete = async (event: { query: string }) => {
    answerSearchTerm.value = event.query;
    answersLoading.value = true;
    try {
      answerSuggestions.value = await searchAnswers(event.query);
    } finally {
      answersLoading.value = false;
    }
  };

  const handleAnswerSelect = (event: { value: Answer }) => {
    if (event?.value) {
      addAnswerToQuestion(event.value);
    }
  };

  const createAnswer = async (text: string): Promise<Answer> => {
    try {
      const response = await trpc.answers.create.mutate({ text });

      if (response.success && response.answer) {
        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: `Ответ "${response.answer.text}" создан`,
        });
        return response.answer as Answer;
      }

      throw new Error("Не удалось создать ответ");
    } catch (error) {
      console.error("Ошибка при создании ответа:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: `Не удалось создать ответ "${text}"`,
      });
      throw error;
    }
  };

  const createAnswerFromInput = async () => {
    const rawValue = answerInput.value;
    const textCandidate =
      typeof rawValue === "string"
        ? rawValue
        : answerSearchTerm.value || rawValue?.text || "";

    const text = textCandidate.trim();

    if (!text) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Введите текст ответа, чтобы создать его",
      });
      return;
    }

    const duplicateInQuestion = questionAnswers.value.some(
      (qa) => qa.answer.text.trim().toLowerCase() === text.toLowerCase()
    );

    if (duplicateInQuestion) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Этот ответ уже добавлен",
      });
      return;
    }

    const existingSuggestion = answerSuggestions.value.find(
      (suggestion) => suggestion.text.trim().toLowerCase() === text.toLowerCase()
    );

    if (existingSuggestion) {
      addAnswerToQuestion(existingSuggestion);
      return;
    }

    try {
      const newAnswer = await createAnswer(text);
      addAnswerToQuestion(newAnswer);
    } catch (error) {
      // Ошибка уже обработана в createAnswer
    }
  };

  const toggleCorrectAnswer = (questionAnswer: QuestionAnswer) => {
    const updatedAnswers = questionAnswers.value.map((qa) =>
      qa.answerId === questionAnswer.answerId
        ? { ...qa, isCorrect: !qa.isCorrect }
        : qa
    );
    emit("update:answers", updatedAnswers);
    emit("toggle-correct", questionAnswer);
  };

  const removeAnswer = (questionAnswer: QuestionAnswer) => {
    const updatedAnswers = questionAnswers.value.filter(
      (qa) => qa.answerId !== questionAnswer.answerId
    );
    emit("update:answers", updatedAnswers);
    emit("remove", questionAnswer);
    toast.add({
      severity: "info",
      summary: "Удалено",
      detail: `Ответ "${questionAnswer.answer.text}" удалён`,
    });
  };

  return {
    answerInput,
    answerSuggestions,
    answersLoading,
    answerSearchTerm,
    canCreateAnswer,
    onAnswerComplete,
    handleAnswerSelect,
    createAnswerFromInput,
    toggleCorrectAnswer,
    removeAnswer,
  };
}

