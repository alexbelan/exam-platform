export interface FilterDropdownOption {
  label: string;
  value: any;
}

export interface FilterDropdownProps {
  modelValue: any;
  label?: string;
  placeholder?: string;
  options: FilterDropdownOption[];
  optionLabel?: string;
  optionValue?: string;
  loading?: boolean;
}

