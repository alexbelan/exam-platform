export interface AdminTagsFilters {
  search?: string;
  categoryId?: number;
}

export interface AdminTagsFiltersProps {
  modelValue: AdminTagsFilters;
  categories: Array<{ id: number; name: string }>;
  categoriesLoading: boolean;
}

export interface AdminTagsFiltersEmits {
  (event: "update:modelValue", value: AdminTagsFilters): void;
  (event: "reset"): void;
}

