/**
 * Типы для работы с профилем и статистикой
 */

export interface UserStatistics {
  totalTestsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageScore: number;
  problematicQuestionsCount: number;
  uncorrectedQuestionsCount: number;
  lastActivityAt: Date | null;
}

export interface StatisticsResponse {
  totalTestsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageScore: number;
  problematicQuestionsCount: number;
  uncorrectedQuestionsCount: number;
  lastActivityAt: Date | null;
}

export interface UpdateUncorrectedQuestionsRequest {
  questionIds: number[];
}

export interface UpdateUncorrectedQuestionsResponse {
  success: boolean;
  data: {
    uncorrectedQuestionsCount: number;
  };
  message: string;
}

