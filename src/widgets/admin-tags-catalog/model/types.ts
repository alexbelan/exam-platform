import type { TagsFilters } from "@features/tags-filters";

export interface AdminTagsCatalogFilters extends TagsFilters {
  page: number;
  limit: number;
}

