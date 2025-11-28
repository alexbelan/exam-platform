export interface Answer {
  id: number;
  text: string;
}

export interface QuestionAnswer {
  id: number | string;
  answerId: number;
  answer: Answer;
  isCorrect: boolean;
}

export interface AdminQuestionAnswersProps {
  answers: QuestionAnswer[];
  loading?: boolean;
}

export interface AdminQuestionAnswersEmits {
  (event: "update:answers", answers: QuestionAnswer[]): void;
  (event: "add", answer: Answer): void;
  (event: "remove", questionAnswer: QuestionAnswer): void;
  (event: "toggle-correct", questionAnswer: QuestionAnswer): void;
}

