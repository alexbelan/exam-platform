import type { CategoryEntity } from "@entities/category";

export interface TagFilterCategory
  extends Pick<CategoryEntity, "id" | "name" | "slug" | "color"> {}

export interface TagFilterTag {
  id: number;
  name: string;
  slug: string;
  category?: TagFilterCategory | null;
}

export interface TagFilterEmits {
  (e: "update:modelValue", value: string[]): void;
}
