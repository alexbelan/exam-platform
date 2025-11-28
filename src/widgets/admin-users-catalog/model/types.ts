import type { AdminUsersFilters } from "@features/admin-users-filters";

export interface AdminUsersCatalogFilters extends AdminUsersFilters {
  page: number;
  limit: number;
}

