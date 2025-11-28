import type { AdminTagsFilters } from "@features/admin-tags-filters";

export interface AdminTagsCatalogFilters extends AdminTagsFilters {
  page: number;
  limit: number;
}

