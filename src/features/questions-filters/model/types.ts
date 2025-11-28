export interface QuestionsFilters {
  search?: string;
  status?: boolean;
}

export interface QuestionsFiltersProps {
  modelValue: QuestionsFilters;
}

export interface QuestionsFiltersEmits {
  (event: "update:modelValue", value: QuestionsFilters): void;
  (event: "reset"): void;
}

