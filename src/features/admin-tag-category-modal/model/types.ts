import type { CategoryEntity } from "@entities/category";

export interface AdminTagCategoryModalProps {
  visible: boolean;
  saving?: boolean;
  category: CategoryEntity | null;
  defaultColor?: string;
}

export interface AdminTagCategoryModalEmits {
  (e: "update:visible", value: boolean): void;
  (e: "save", payload: { id?: number; name: string; color: string }): void;
  (e: "cancel"): void;
}

export interface AdminTagCategoryFormState {
  name: string;
  color: string;
}
