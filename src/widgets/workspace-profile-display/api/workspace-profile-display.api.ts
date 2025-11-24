import type { WorkspaceQuestion } from "@entities/questions-card/model/types";

export interface IncorrectAnswersResponse {
  questions: WorkspaceQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Получить неправильные ответы пользователя
 */
export async function getIncorrectAnswers(
  page: number = 1,
  limit: number = 12
): Promise<IncorrectAnswersResponse> {
  return $fetch<IncorrectAnswersResponse>("/api/profile/incorrect-answers", {
    query: { page, limit },
  });
}

