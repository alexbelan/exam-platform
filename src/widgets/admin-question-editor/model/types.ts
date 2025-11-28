import type { QuestionFormData, Tag } from "@features/admin-question-form";
import type { QuestionAnswer } from "@features/admin-question-answers";

export interface Question {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  requiresPremium?: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number | null;
  tags?: Tag[];
  questionAnswers?: QuestionAnswer[];
}

export interface AdminQuestionEditorProps {
  questionId: string | number | null;
  loading?: boolean;
}

export interface AdminQuestionEditorEmits {
  (event: "save", data: {
    title: string;
    content: string;
    isPublished: boolean;
    requiresPremium: boolean;
    categoryId?: number | null;
    tags: number[];
    answers: Array<{ id: string; isCorrect: boolean }>;
  }): void;
  (event: "cancel"): void;
}

