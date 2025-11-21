import type { CategoryEntity } from "@entities/category";

export interface TagEntity {
  id: number;
  name: string;
  slug: string;
  category?: CategoryEntity | null;
}

export interface AdminTagModalProps {
  visible: boolean;
  saving?: boolean;
  categories: CategoryEntity[];
  tag: TagEntity | null;
}

export interface AdminTagModalEmits {
  (e: "update:visible", value: boolean): void;
  (e: "save", payload: { id?: number; name: string; categoryId: number }): void;
  (e: "cancel"): void;
}

export interface AdminTagModalFormState {
  name: string;
  categoryId: number | null;
}
