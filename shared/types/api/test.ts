/**
 * Типы для работы с тестами
 */

export interface TestMeta {
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
}

export interface TestMetaResponse {
  success: boolean;
  test: TestMeta;
  message: string;
}

export interface TestGenerateResponse {
  success: boolean;
  questions: number[];
  message: string;
}

