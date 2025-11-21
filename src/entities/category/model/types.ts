export interface CategoryEntity {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
  tagCount?: number;
}

