export interface QuestionFormData {
  title: string;
  content: string;
  isPublished: boolean;
  requiresPremium: boolean;
  categoryId: number | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
}

export interface AdminQuestionFormProps {
  modelValue: QuestionFormData;
  selectedTags: Tag[];
  loading?: boolean;
}

export interface AdminQuestionFormEmits {
  (event: "update:modelValue", value: QuestionFormData): void;
  (event: "update:selectedTags", tags: Tag[]): void;
}

