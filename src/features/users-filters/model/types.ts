export interface UsersFilters {
  search?: string;
  role?: string;
  status?: boolean;
  subscription?: string;
}

export interface UsersFiltersProps {
  modelValue: UsersFilters;
}

export interface UsersFiltersEmits {
  (event: "update:modelValue", value: UsersFilters): void;
  (event: "reset"): void;
}

