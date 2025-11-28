import type { UsersFilters } from "@features/users-filters";

export interface AdminUsersCatalogFilters extends UsersFilters {
  page: number;
  limit: number;
}

