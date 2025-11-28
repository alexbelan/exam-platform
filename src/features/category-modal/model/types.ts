import type { CategoryEntity } from "@entities/category";

export interface CategoryModalProps {
  visible: boolean;
  saving?: boolean;
  category: CategoryEntity | null;
  defaultColor?: string;
}

export interface CategoryModalEmits {
  (e: "update:visible", value: boolean): void;
  (e: "save", payload: { id?: number; name: string; color: string }): void;
  (e: "cancel"): void;
}

export interface AdminTagCategoryFormState {
  name: string;
  color: string;
}
