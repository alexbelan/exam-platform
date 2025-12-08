import type { TestsFilters } from "@features/tests-filters";

export interface AdminTestsCatalogFilters extends TestsFilters {
  page: number;
  limit: number;
}
