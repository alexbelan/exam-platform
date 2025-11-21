export interface TestTag {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
}

export interface TestPreviewData {
  id: string | number;
  name: string;
  description: string | null;
  tags: TestTag[];
  primaryTag: TestTag | null;
  questionsCount: number;
}

export interface TestPreviewProps {
  testId: string | number;
  test: TestPreviewData;
  tags: TestTag[];
}

