export interface ActionsHeaderProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  hasActiveFilters?: boolean;
  /** @deprecated Use @search-update event instead */
  onSearchUpdate?: (value: string) => void;
  /** @deprecated Use @reset-filters event instead */
  onResetFilters?: () => void;
}

