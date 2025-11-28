export interface AdminTestsFilters {
  search?: string;
}

export interface AdminTestsFiltersProps {
  modelValue: AdminTestsFilters;
}

export interface AdminTestsFiltersEmits {
  (event: "update:modelValue", value: AdminTestsFilters): void;
  (event: "reset"): void;
}

