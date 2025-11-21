export interface QuestionResult {
  questionId: number;
  isCorrect: boolean;
  correctAnswerIds: Set<number>;
  userAnswerIds: Set<number>;
}

export interface TestResultsProps {
  testName: string;
  correctAnswers: number;
  totalQuestions: number;
  questionResults: Map<number, QuestionResult>;
  questionIds: number[];
}

