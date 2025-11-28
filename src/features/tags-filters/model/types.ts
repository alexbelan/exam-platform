export interface TagsFilters {
  search?: string;
  categoryId?: number;
}

export interface TagsFiltersProps {
  modelValue: TagsFilters;
  categories: Array<{ id: number; name: string }>;
  categoriesLoading: boolean;
}

export interface TagsFiltersEmits {
  (event: "update:modelValue", value: TagsFilters): void;
  (event: "reset"): void;
}

