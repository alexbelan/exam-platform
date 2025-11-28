import type { TableColumn } from "@shared/ui/Table";
import type { AdminTestTagOption } from "@features/admin-test-modal";

export interface Test {
  id: number;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  isPublished: boolean;
  requiresPremium?: boolean;
  createdAt: string;
  updatedAt: string;
  tags: AdminTestTagOption[];
  primaryTag: AdminTestTagOption | null;
}

export interface AdminTestsTableFilters {
  search?: string;
  page: number;
  limit: number;
}

export type AdminTestsTableColumn = TableColumn<Test>;

export interface AdminTestsTableProps {
  tests: Test[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: AdminTestsTableColumn[];
}

export interface AdminTestsTableEmits {
  (event: "edit", test: Test): void;
  (event: "delete", test: Test): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

