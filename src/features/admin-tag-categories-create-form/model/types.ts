export interface AdminTagCategoriesCreateFormData {
  name: string;
  color: string;
}

export interface AdminTagCategoriesCreateFormEmits {
  (event: "submit", data: { name: string; color: string }): void;
}

