import type { UsersFiltersType } from "@features/users-filters";

export interface AdminUsersCatalogFilters extends UsersFiltersType {
  page: number;
  limit: number;
}
