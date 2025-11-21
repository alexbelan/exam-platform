import type { TestMetaResponse, TestGenerateResponse } from '#shared/types/api/test';
import type { QuestionResponse } from '#shared/types/api/question';
import type {
  UpdateUncorrectedQuestionsRequest,
  UpdateUncorrectedQuestionsResponse,
} from '#shared/types/api/profile';

/**
 * API функции для виджета test-taking
 * Все запросы, связанные с прохождением теста
 */

/**
 * Получить метаданные теста
 */
export async function getTestMeta(
  testId: string | number
): Promise<TestMetaResponse> {
  return $fetch<TestMetaResponse>(`/api/tests/${testId}`);
}

/**
 * Сгенерировать вопросы для теста
 */
export async function generateTestQuestions(
  testId: string | number
): Promise<TestGenerateResponse> {
  return $fetch<TestGenerateResponse>(`/api/tests/${testId}/generate`);
}

/**
 * Получить вопрос по ID
 */
export async function getQuestion(
  questionId: number
): Promise<QuestionResponse> {
  return $fetch<QuestionResponse>(`/api/questions/${questionId}`);
}

/**
 * Обновить счетчик непройденных вопросов
 */
export async function updateUncorrectedQuestions(
  data: UpdateUncorrectedQuestionsRequest
): Promise<UpdateUncorrectedQuestionsResponse> {
  return $fetch<UpdateUncorrectedQuestionsResponse>(
    '/api/profile/statistics/uncorrected-questions',
    {
      method: 'PUT',
      body: data,
    }
  );
}

