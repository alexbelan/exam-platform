/**
 * Типы для работы с вопросами
 */

export interface QuestionTag {
  id: number;
  name: string;
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

export interface QuestionAnswer {
  id: number;
  isCorrect: boolean;
  answer: {
    id: number;
    text: string;
  };
}

export interface Question {
  id: number;
  title: string;
  content: string;
  tags: QuestionTag[];
  questionAnswers: QuestionAnswer[];
}

export interface QuestionResponse {
  success: boolean;
  question: Question;
}

