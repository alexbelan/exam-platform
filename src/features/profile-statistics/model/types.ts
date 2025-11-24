import type { ProfileStatistics } from "@entities/profile-state";

export interface UseProfileStatisticsReturn {
  statistics: ComputedRef<ProfileStatistics | null>;
  pending: ComputedRef<boolean>;
  error: ComputedRef<Error | null>;
  refresh: () => Promise<void>;
}
