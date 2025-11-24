export type ProfileContentFilter =
  | "favorite-questions"
  | "favorite-tests"
  | "incorrect-answers";

export interface ProfileStatistics {
  totalTestsCompleted: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  averageScore: number;
  problematicQuestionsCount: number;
  uncorrectedQuestionsCount: number;
  lastActivityAt: Date | null;
}

export interface ProfileState {
  activeFilter: ProfileContentFilter;
  statistics: ProfileStatistics | null;
  favoriteQuestions: any[];
  favoriteTests: any[];
  incorrectAnswers: any[];
  lastFetch: {
    statistics: number | null;
    favoriteQuestions: number | null;
    favoriteTests: number | null;
    incorrectAnswers: number | null;
  };
}

