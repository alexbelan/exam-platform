import type { TableColumn } from "@shared/ui/Table";
import type { CategoryEntity } from "@entities/category";

export type CategoryTableItem = CategoryEntity & { tagCount: number };

export interface CategoriesTableFilters {
  page: number;
  limit: number;
}

export type CategoriesTableColumn = TableColumn<CategoryTableItem>;

export interface CategoriesTableProps {
  categories: CategoryTableItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: CategoriesTableColumn[];
}

export interface CategoriesTableEmits {
  (event: "edit", category: CategoryTableItem): void;
  (event: "delete", category: CategoryTableItem): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

