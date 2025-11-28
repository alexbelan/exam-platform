export interface TestTagOption {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
}

export interface TestFormState {
  id: number | null;
  name: string;
  description: string;
  questionCount: number;
  questionIdsRaw: string;
  tags: TestTagOption[];
  primaryTag: TestTagOption | null;
  isPublished: boolean;
  requiresPremium: boolean;
}

export interface TestModalSubmitPayload {
  id: number | null;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  tagIds: number[];
  primaryTagId: number | null;
  isPublished: boolean;
  requiresPremium: boolean;
}

export interface TestModalProps {
  visible: boolean;
  saving?: boolean;
  tagsLoading?: boolean;
  tagOptions: TestTagOption[];
  value: TestFormState | null;
}

export interface TestModalEmits {
  (e: "update:visible", value: boolean): void;
  (e: "cancel"): void;
  (e: "submit", payload: TestModalSubmitPayload): void;
}
