// Метаданные теста (без вопросов)
export interface TestMetaResponse {
  success: boolean;
  test: {
    id: number;
    name: string;
    description: string | null;
    questionCount: number;
    tags: Array<{
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    }>;
    primaryTag: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    } | null;
    isPublished: boolean;
  };
  message: string;
}

// Генерация вопросов
export interface TestGenerateResponse {
  success: boolean;
  questions: number[];
  message: string;
}

// Объединенный тип для совместимости
export interface TestResponse {
  success: boolean;
  test: {
    id: number;
    name: string;
    description: string | null;
    questionCount: number;
    tags: Array<{
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    }>;
    primaryTag: {
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    } | null;
    isPublished: boolean;
  };
  questions: number[];
  message: string;
}

export interface QuestionResponse {
  success: boolean;
  question: {
    id: number;
    title: string;
    content: string;
    tags: Array<{
      id: number;
      name: string;
      category: {
        id: number;
        name: string;
        color: string;
      } | null;
    }>;
    questionAnswers: Array<{
      id: number;
      isCorrect: boolean;
      answer: {
        id: number;
        text: string;
      };
    }>;
  };
}
