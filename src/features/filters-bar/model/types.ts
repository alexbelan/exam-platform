export interface FiltersBarFilters {
  search?: string;
  tags?: string[];
}

export interface FiltersBarProps {
  modelValue: FiltersBarFilters;
  searchLabel?: string;
  searchPlaceholder?: string;
}

export interface FiltersBarEmits {
  (event: "update:modelValue", value: FiltersBarFilters): void;
  (event: "reset"): void;
}
