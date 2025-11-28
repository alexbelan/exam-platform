import type { TableColumn } from "@shared/ui/Table";
import type { CategoryEntity } from "@entities/category";

export type CategoryTableItem = CategoryEntity & { tagCount: number };

export interface AdminTagCategoriesTableFilters {
  page: number;
  limit: number;
}

export type AdminTagCategoriesTableColumn = TableColumn<CategoryTableItem>;

export interface AdminTagCategoriesTableProps {
  categories: CategoryTableItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: AdminTagCategoriesTableColumn[];
}

export interface AdminTagCategoriesTableEmits {
  (event: "edit", category: CategoryTableItem): void;
  (event: "delete", category: CategoryTableItem): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

