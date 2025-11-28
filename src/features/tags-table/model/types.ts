import type { TableColumn } from "@shared/ui/Table";
import type { TagEntity } from "@features/tag-modal";
import type { CategoryEntity } from "@entities/category";

export type Tag = TagEntity;

export interface TagsTableFilters {
  search?: string;
  categoryId?: number;
  page: number;
  limit: number;
}

export type TagsTableColumn = TableColumn<Tag>;

export interface TagsTableProps {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  columns: TagsTableColumn[];
}

export interface TagsTableEmits {
  (event: "edit", tag: Tag): void;
  (event: "delete", tag: Tag): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

export interface TagUtils {
  getTagColor: (tag: Tag) => string;
  getTagChipStyle: (category?: CategoryEntity | null) => Record<string, string>;
}

