export interface FilterDropdownOption {
  label: string;
  value: string | number | boolean | null;
}

export interface FilterDropdownProps {
  modelValue: string | number | boolean | null;
  label?: string;
  placeholder?: string;
  options: FilterDropdownOption[];
  optionLabel?: string;
  optionValue?: string;
  loading?: boolean;
}
