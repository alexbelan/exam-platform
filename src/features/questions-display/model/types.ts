export interface QuestionsResponseCategory {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
}

export interface QuestionsResponseTag {
  id: number;
  name: string;
  slug: string;
  category?: QuestionsResponseCategory | null;
}

export interface QuestionsResponseQuestion {
  id: number;
  title: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags: QuestionsResponseTag[];
  isFavorite?: boolean;
}

export interface QuestionsResponse {
  questions: QuestionsResponseQuestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface QuestionsDisplayFilters {
  search?: string;
  level?: string;
  tags?: string[];
}


