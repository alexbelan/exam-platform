export interface ProfileHeaderUser {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export interface ProfileHeaderStatistics {
  totalTestsCompleted: number;
  problematicQuestionsCount: number;
  uncorrectedQuestionsCount: number;
  averageScore: number;
}

export interface ProfileHeaderProps {
  user: ProfileHeaderUser;
  statistics: ProfileHeaderStatistics | null;
  loading?: boolean;
}

