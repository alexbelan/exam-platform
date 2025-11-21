export interface TestsResponseCategory {
  id: number;
  name: string;
  color?: string | null;
}

export interface TestsResponseTag {
  id: number;
  name: string;
  slug: string;
  category?: TestsResponseCategory | null;
}

export interface TestsResponseTest {
  id: number;
  name: string;
  description: string | null;
  questionCount: number;
  questionIds: number[];
  isPublished: boolean;
  tags: TestsResponseTag[];
  primaryTag?: TestsResponseTag | null;
}

export interface TestsResponse {
  tests: TestsResponseTest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WorkspaceTestDisplayFilters {
  search?: string;
  tags?: string[];
}

