export interface WorkspaceCategory {
  id: number;
  name: string;
  color?: string | null;
}

export interface WorkspaceTestTag {
  id: number;
  name: string;
  category?: WorkspaceCategory | null;
}

export interface WorkspaceTest {
  id: number;
  title: string;
  description?: string | null;
  questionsCount: number;
  questionIds: number[];
  isPublished: boolean;
  tags?: WorkspaceTestTag[];
  isFavorite?: boolean;
}

export interface TestCardProps {
  test: WorkspaceTest;
}

export interface TestCardLogicProps extends TestCardProps {
  onStartTest: (id: number) => void;
  onToggleBookmark: (id: number) => void;
}
