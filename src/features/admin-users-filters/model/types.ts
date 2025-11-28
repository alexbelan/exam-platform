export interface AdminUsersFilters {
  search?: string;
  role?: string;
  status?: boolean;
  subscription?: string;
}

export interface AdminUsersFiltersProps {
  modelValue: AdminUsersFilters;
}

export interface AdminUsersFiltersEmits {
  (event: "update:modelValue", value: AdminUsersFilters): void;
  (event: "reset"): void;
}

