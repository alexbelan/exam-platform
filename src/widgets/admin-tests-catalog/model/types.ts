import type { AdminTestsFilters } from "@features/admin-tests-filters";

export interface AdminTestsCatalogFilters extends AdminTestsFilters {
  page: number;
  limit: number;
}

