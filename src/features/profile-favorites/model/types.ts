import type { WorkspaceQuestion } from "@entities/questions-card/model/types";
import type { WorkspaceTest } from "@entities/test-card/model/types";

import type { ComputedRef } from "vue";

export interface UseProfileFavoritesReturn {
  favoriteQuestions: ComputedRef<WorkspaceQuestion[]>;
  favoriteQuestionsPending: ComputedRef<boolean>;
  favoriteQuestionsError: ComputedRef<Error | null>;
  refreshFavoriteQuestions: () => Promise<void>;

  favoriteTests: ComputedRef<WorkspaceTest[]>;
  favoriteTestsPending: ComputedRef<boolean>;
  favoriteTestsError: ComputedRef<Error | null>;
  refreshFavoriteTests: () => Promise<void>;
}

