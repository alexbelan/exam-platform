import { computed, ref, watch } from "vue";
import type { TestResultsProps, QuestionResult } from "./types";
import { useTestSessionStore } from "@entities/test-session";

interface Question {
  id: number;
  title: string;
  content: string;
  questionAnswers: Array<{
    id: number;
    isCorrect: boolean;
    answer: {
      id: number;
      text: string;
    };
  }>;
}

interface QuestionResponse {
  success: boolean;
  question: Question;
}

export function useTestResults(props: TestResultsProps) {
  const store = useTestSessionStore();

  const goBack = () => {
    navigateTo("/workspace/tests");
  };

  const isPerfectScore = computed(() => {
    return props.correctAnswers === props.totalQuestions;
  });

  const hasDetailsData = computed(() => {
    return (
      props.questionResults &&
      props.questionResults.size > 0 &&
      props.questionIds &&
      props.questionIds.length > 0
    );
  });

  // Состояние модалки
  const showDetailsModal = ref(false);
  const loadedQuestions = ref<Map<number, Question>>(new Map());
  const loadingQuestions = ref<Set<number>>(new Set());

  const openDetailsModal = () => {
    showDetailsModal.value = true;
  };

  const closeDetailsModal = () => {
    showDetailsModal.value = false;
  };

  // Получить результат вопроса
  const getQuestionResult = (
    questionId: number
  ): QuestionResult | undefined => {
    return props.questionResults.get(questionId);
  };

  // Определить статус вопроса: 'correct' | 'incorrect' | 'partial'
  const getQuestionStatus = (
    questionId: number
  ): "correct" | "incorrect" | "partial" => {
    const result = getQuestionResult(questionId);
    if (!result) return "incorrect";

    if (result.isCorrect) {
      return "correct";
    }

    // Проверяем, есть ли пересечение между правильными и выбранными ответами
    const hasCorrectAnswers = [...result.correctAnswerIds].some((id) =>
      result.userAnswerIds.has(id)
    );
    const hasIncorrectAnswers = [...result.userAnswerIds].some(
      (id) => !result.correctAnswerIds.has(id)
    );

    // Частично правильный: есть правильные ответы, но не все, или есть неправильные
    if (
      hasCorrectAnswers &&
      (result.userAnswerIds.size < result.correctAnswerIds.size ||
        hasIncorrectAnswers)
    ) {
      return "partial";
    }

    return "incorrect";
  };

  // Загрузить вопрос для получения названия
  const loadQuestion = async (questionId: number) => {
    // Проверяем кэш в сторе
    const cachedQuestion = store.getCachedQuestion(questionId);
    if (cachedQuestion) {
      loadedQuestions.value.set(questionId, cachedQuestion);
      return;
    }

    // Проверяем локальный кэш
    if (loadedQuestions.value.has(questionId)) {
      return;
    }

    if (loadingQuestions.value.has(questionId)) {
      return;
    }

    loadingQuestions.value.add(questionId);

    try {
      const { getQuestion } = useAsyncTestResults();
      const response = await getQuestion(questionId);
      const question = response.question;
      loadedQuestions.value.set(questionId, question);
      // Сохраняем в кэш стора для будущего использования
      store.cacheQuestion(questionId, question);
    } catch (err) {
      console.error(`Error loading question ${questionId}:`, err);
    } finally {
      loadingQuestions.value.delete(questionId);
    }
  };

  // Загрузить все вопросы при открытии модалки
  watch(showDetailsModal, (isOpen) => {
    if (isOpen) {
      props.questionIds.forEach((questionId) => {
        loadQuestion(questionId);
      });
    }
  });

  // Получить загруженный вопрос
  const getQuestion = (questionId: number): Question | undefined => {
    return loadedQuestions.value.get(questionId);
  };

  // Проверка, загружается ли вопрос
  const isQuestionLoading = (questionId: number): boolean => {
    return loadingQuestions.value.has(questionId);
  };

  return {
    goBack,
    isPerfectScore,
    hasDetailsData,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    getQuestionResult,
    getQuestionStatus,
    getQuestion,
    isQuestionLoading,
  };
}
