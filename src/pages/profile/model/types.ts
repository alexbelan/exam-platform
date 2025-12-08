import type { ComputedRef, Ref } from "vue";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";
import type { WorkspaceTest } from "@entities/test-card/model/types";
import type { ProfileContentFilter } from "@entities/profile-state";
import type { RouterOutputs } from "#shared/types/trpc";

export interface UseWorkspaceProfileDisplayReturn {
  questions: ComputedRef<WorkspaceQuestion[]>;
  tests: ComputedRef<WorkspaceTest[]>;
  pending: ComputedRef<boolean>;
  loadingMore: ComputedRef<boolean>;
  error: ComputedRef<Error | null>;
  hasMore: ComputedRef<boolean>;
  activeFilter: ComputedRef<ProfileContentFilter>;
  refresh: () => Promise<void>;
  handleToggleQuestionBookmark: (questionId: number) => Promise<void>;
  handleToggleTestBookmark: (testId: number) => Promise<void>;
  setupInfiniteScroll: (triggerRef: Ref<HTMLElement | null>) => void;
}

// Типы из tRPC для избранных вопросов и тестов
type FavoriteQuestionsResponse =
  RouterOutputs["profile"]["getFavoriteQuestions"];
type FavoriteTestsResponse = RouterOutputs["profile"]["getFavoriteTests"];

// Типы для отдельных элементов (сырые данные из API)
export type FavoriteQuestionRaw =
  FavoriteQuestionsResponse["questions"][number];
export type FavoriteTestRaw = FavoriteTestsResponse["tests"][number];
