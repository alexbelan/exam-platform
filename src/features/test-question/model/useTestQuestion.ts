import { computed, ref, watch } from "vue";
import type { TestQuestionProps } from "./types";
import type { Question } from "./types";

interface QuestionResponse {
  success: boolean;
  question: {
    id: number;
    title: string;
    content: string;
    tags: Array<{
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    }>;
    questionAnswers: Array<{
      id: number;
      isCorrect: boolean;
      answer: {
        id: number;
        text: string;
      };
    }>;
  };
}

interface UseTestQuestionOptions {
  onAnswerChange?: (
    answerId: number,
    evt: Event,
    questionId: number,
    questionType: "radio" | "checkbox"
  ) => void;
  onRetry?: () => void;
}

export function useTestQuestion(
  props: TestQuestionProps,
  options?: UseTestQuestionOptions
) {
  const question = ref<Question | null>(null);
  const pending = ref(false);
  const error = ref(false);

  const questionName = computed(() => {
    if (!question.value) return "";
    return `question-${question.value.id}`;
  });

  // Вычисляем тип вопроса на основе загруженного вопроса
  const questionType = computed<"radio" | "checkbox">(() => {
    if (!question.value) return "radio";
    const correctCount = question.value.questionAnswers.filter(
      (qa) => qa.isCorrect
    ).length;
    return correctCount > 1 ? "checkbox" : "radio";
  });

  // Проверяем, можно ли перейти к следующему вопросу (есть выбранные ответы)
  const canProceed = computed(() => {
    return props.selectedAnswers.size > 0;
  });

  // Логика загрузки вопроса по ID
  const loadQuestion = async () => {
    if (!props.questionId) {
      question.value = null;
      pending.value = false;
      error.value = false;
      return;
    }

    pending.value = true;
    error.value = false;

    try {
      const response = await $fetch<QuestionResponse>(
        `/api/questions/${props.questionId}`
      );
      question.value = response.question;
    } catch (err) {
      console.error("Error loading question:", err);
      error.value = true;
      question.value = null;
    } finally {
      pending.value = false;
    }
  };

  // Загружаем вопрос при изменении questionId
  watch(() => props.questionId, loadQuestion, { immediate: true });

  // Обработка изменения ответа
  const handleAnswerChange = (answerId: number, evt: Event) => {
    if (question.value && options?.onAnswerChange) {
      options.onAnswerChange(
        answerId,
        evt,
        question.value.id,
        questionType.value
      );
    }
  };

  // Обработка повторной попытки
  const handleRetry = () => {
    loadQuestion();
    if (options?.onRetry) {
      options.onRetry();
    }
  };

  return {
    question,
    pending,
    error,
    questionName,
    questionType,
    canProceed,
    loadQuestion,
    handleAnswerChange,
    handleRetry,
  };
}
