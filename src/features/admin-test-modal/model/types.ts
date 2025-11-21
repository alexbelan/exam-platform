export interface AdminTestTagOption {
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

export interface AdminTestFormState {
  id: number | null;
  name: string;
  description: string;
  questionCount: number;
  questionIdsRaw: string;
  tags: AdminTestTagOption[];
  primaryTag: AdminTestTagOption | null;
  isPublished: boolean;
}

export interface AdminTestModalSubmitPayload {
  id: number | null;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  tagIds: number[];
  primaryTagId: number | null;
  isPublished: boolean;
}

export interface AdminTestModalProps {
  visible: boolean;
  saving?: boolean;
  tagsLoading?: boolean;
  tagOptions: AdminTestTagOption[];
  value: AdminTestFormState | null;
}

export interface AdminTestModalEmits {
  (e: "update:visible", value: boolean): void;
  (e: "cancel"): void;
  (e: "submit", payload: AdminTestModalSubmitPayload): void;
}
