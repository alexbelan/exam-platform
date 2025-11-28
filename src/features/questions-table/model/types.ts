import type { TableColumn } from "@shared/ui/Table";

export interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: Category | null;
}

export interface Question {
  id: number;
  title: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface QuestionsTableFilters {
  search?: string;
  status?: boolean;
  page: number;
  limit: number;
}

export type QuestionsTableColumn = TableColumn<Question>;

export interface QuestionsTableProps {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: QuestionsTableColumn[];
}

export interface QuestionsTableEmits {
  (event: "view", question: Question): void;
  (event: "toggle-publish", question: Question): void;
  (event: "delete", question: Question): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

