import type { WorkspaceQuestion } from "@entities/questions-card/model/types";
import type { WorkspaceTest } from "@entities/test-card/model/types";

export interface FavoriteQuestionsResponse {
  questions: WorkspaceQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FavoriteTestsResponse {
  tests: WorkspaceTest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Получить избранные вопросы пользователя
 */
export async function getFavoriteQuestions(
  page: number = 1,
  limit: number = 12
): Promise<FavoriteQuestionsResponse> {
  return $fetch<FavoriteQuestionsResponse>(
    "/api/profile/favorites/questions",
    {
      query: { page, limit },
    }
  );
}

/**
 * Получить избранные тесты пользователя
 */
export async function getFavoriteTests(
  page: number = 1,
  limit: number = 12
): Promise<FavoriteTestsResponse> {
  return $fetch<FavoriteTestsResponse>("/api/profile/favorites/tests", {
    query: { page, limit },
  });
}

