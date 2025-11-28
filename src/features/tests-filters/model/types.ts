export interface TestsFilters {
  search?: string;
}

export interface TestsFiltersProps {
  modelValue: TestsFilters;
}

export interface TestsFiltersEmits {
  (event: "update:modelValue", value: TestsFilters): void;
  (event: "reset"): void;
}

