import type { AdminQuestionsFilters } from "@features/admin-questions-filters";

export interface AdminQuestionsCatalogFilters extends AdminQuestionsFilters {
  page: number;
  limit: number;
}

