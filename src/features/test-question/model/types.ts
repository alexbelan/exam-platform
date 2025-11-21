import type { Answer } from "@entities/answer-option";

export interface QuestionAnswer {
  id: number;
  isCorrect: boolean;
  answer: Answer;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  questionAnswers: QuestionAnswer[];
}

export interface TestQuestionProps {
  questionId: number | null;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswers: Set<number>;
}

