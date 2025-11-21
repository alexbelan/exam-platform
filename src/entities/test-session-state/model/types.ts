export interface TestSessionState {
  testId: number | null;
  questionIds: number[]; // Список ID вопросов
  currentQuestionIndex: number;
  userAnswers: Map<number, Set<number>>; // questionId -> Set<answerId>
  startedAt: number | null;
  loadedQuestions: Map<number, any>; // Кэш загруженных вопросов
}

// Тип для сериализации в localStorage
export interface SerializedSession {
  testId: number | null;
  questionIds: number[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number[]>; // questionId (string) -> answerId[]
  startedAt: number | null;
  loadedQuestions: Record<string, any>; // questionId (string) -> question data
}
