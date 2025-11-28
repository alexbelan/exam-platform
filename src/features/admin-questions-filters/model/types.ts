export interface AdminQuestionsFilters {
  search?: string;
  status?: boolean;
}

export interface AdminQuestionsFiltersProps {
  modelValue: AdminQuestionsFilters;
}

export interface AdminQuestionsFiltersEmits {
  (event: "update:modelValue", value: AdminQuestionsFilters): void;
  (event: "reset"): void;
}

