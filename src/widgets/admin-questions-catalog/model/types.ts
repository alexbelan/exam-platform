import type { QuestionsFilters } from "@features/questions-filters";

export interface AdminQuestionsCatalogFilters extends QuestionsFilters {
  page: number;
  limit: number;
}

