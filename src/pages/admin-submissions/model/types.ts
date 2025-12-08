export interface AdminSubmissionsCatalogFilters {
  search?: string;
  status?: string | null;
  date?: Date | null;
  page: number;
  limit: number;
}
