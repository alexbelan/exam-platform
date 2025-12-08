import { trpc } from "#shared/lib/trpc";
import type { TestMetaResponse, QuestionResponse } from "./types";

export const useAsyncTestTaking = (testId: string | number) => {
  // Получить метаданные теста
  const getTestMeta = async (): Promise<TestMetaResponse> => {
    const result = await trpc.tests.getById.query({ id: Number(testId) });
    return {
      success: true,
      test: result.test,
      message: result.message,
    };
  };

  // Сгенерировать вопросы для теста
  const generateTestQuestions = async () => {
    const result = await trpc.tests.generateQuestions.mutate({
      id: Number(testId),
    });
    return {
      success: true,
      questions: result.questions,
      message: result.message,
    };
  };

  // Получить вопрос по ID
  const getQuestion = async (questionId: number): Promise<QuestionResponse> => {
    const result = await trpc.questions.getById.query({ id: questionId });
    return {
      success: true,
      question: result.question,
    };
  };

  // Обновить счетчик непройденных вопросов
  const updateUncorrectedQuestions = async (questionIds: number[]) => {
    const result = await trpc.profile.updateUncorrectedQuestions.mutate({
      questionIds,
    });
    return {
      success: true,
      data: result,
      message: result.message,
    };
  };

  // Сохранить результаты прохождения теста
  const submitTestAttempt = async (data: {
    testId: number;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent?: number;
    startedAt: Date;
    completedAt: Date;
    questionAnswers: Array<{
      questionId: number;
      userAnswerIds: number[];
      correctAnswerIds: number[];
      isCorrect: boolean;
      timeSpent?: number;
    }>;
  }) => {
    const result = await trpc.tests.submitAttempt.mutate(data);
    return {
      success: true,
      attempt: result.attempt,
      message: result.message,
    };
  };

  return {
    getTestMeta,
    generateTestQuestions,
    getQuestion,
    updateUncorrectedQuestions,
    submitTestAttempt,
  };
};
