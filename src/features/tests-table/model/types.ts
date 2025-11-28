import type { TableColumn } from "@shared/ui/Table";
import type { TestTagOption } from "@features/test-modal";

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
  tags: TestTagOption[];
  primaryTag: TestTagOption | null;
}

export interface TestsTableFilters {
  search?: string;
  page: number;
  limit: number;
}

export type TestsTableColumn = TableColumn<Test>;

export interface TestsTableProps {
  tests: Test[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: TestsTableColumn[];
}

export interface TestsTableEmits {
  (event: "edit", test: Test): void;
  (event: "delete", test: Test): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

