export interface WorkspaceCategory {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
}

export interface WorkspaceQuestionTag {
  id: number;
  name: string;
  slug: string;
  category?: WorkspaceCategory | null;
}

export interface WorkspaceQuestion {
  id: number;
  title: string;
  level?: string | null;
  description?: string | null;
  content?: string | null;
  tags?: WorkspaceQuestionTag[];
}

export interface QuestionCardLogicProps {
  question: WorkspaceQuestion;
  bookmarks: Set<number>;
  onToggleBookmark: (id: number) => void;
  onOpen: (id: number) => void;
}

export interface QuestionCardProps {
  question: WorkspaceQuestion;
  bookmarks: Set<number>;
}
