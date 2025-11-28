export interface AdminSubmissionsFilters {
  search?: string;
  status?: string | null;
  date?: Date | null;
}

export interface AdminSubmissionsFiltersProps {
  modelValue: AdminSubmissionsFilters;
}

export interface AdminSubmissionsFiltersEmits {
  (event: "update:modelValue", value: AdminSubmissionsFilters): void;
  (event: "reset"): void;
}

