export interface CategoryFormData {
  name: string;
  color: string;
}

export interface CategoryFormEmits {
  (event: "submit", data: { name: string; color: string }): void;
}

