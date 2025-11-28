export interface SubmissionsFilters {
  search?: string;
  status?: string | null;
  date?: Date | null;
}

export interface SubmissionsFiltersProps {
  modelValue: SubmissionsFilters;
}

export interface SubmissionsFiltersEmits {
  (event: "update:modelValue", value: SubmissionsFilters): void;
  (event: "reset"): void;
}

