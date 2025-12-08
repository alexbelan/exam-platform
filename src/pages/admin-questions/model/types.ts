export interface AdminQuestionsCatalogFilters {
  search?: string;
  status?: boolean | null;
  page: number;
  limit: number;
}
