import type { ProfileStatistics } from "@entities/profile-state";

export interface ProfileStatisticsResponse {
  totalTestsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageScore: number;
  problematicQuestionsCount: number;
  uncorrectedQuestionsCount: number;
  lastActivityAt: string | null;
}

/**
 * Получить статистику профиля пользователя
 */
export async function getProfileStatistics(): Promise<ProfileStatisticsResponse> {
  return $fetch<ProfileStatisticsResponse>("/api/profile/statistics");
}
