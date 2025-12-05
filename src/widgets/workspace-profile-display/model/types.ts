import type { ComputedRef, Ref } from "vue";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";
import type { WorkspaceTest } from "@entities/test-card/model/types";
import type { ProfileContentFilter } from "@entities/profile-state";

export interface UseWorkspaceProfileDisplayReturn {
  questions: ComputedRef<WorkspaceQuestion[]>;
  tests: ComputedRef<WorkspaceTest[]>;
  pending: ComputedRef<boolean>;
  loadingMore: ComputedRef<boolean>;
  error: ComputedRef<Error | null>;
  hasMore: ComputedRef<boolean>;
  activeFilter: ComputedRef<ProfileContentFilter>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadMoreTrigger: Ref<HTMLElement | null>;
  handleToggleQuestionBookmark: (questionId: number) => Promise<void>;
  handleToggleTestBookmark: (testId: number) => Promise<void>;
}
