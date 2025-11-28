import type { TableColumn } from "@shared/ui/Table";
import type { TagEntity } from "@features/admin-tag-modal";
import type { CategoryEntity } from "@entities/category";

export type Tag = TagEntity;

export interface AdminTagsTableFilters {
  search?: string;
  categoryId?: number;
  page: number;
  limit: number;
}

export type AdminTagsTableColumn = TableColumn<Tag>;

export interface AdminTagsTableProps {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: AdminTagsTableColumn[];
}

export interface AdminTagsTableEmits {
  (event: "edit", tag: Tag): void;
  (event: "delete", tag: Tag): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

export interface TagUtils {
  getTagColor: (tag: Tag) => string;
  getTagChipStyle: (category?: CategoryEntity | null) => Record<string, string>;
}

