export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  subscriptionType: string;
  subscriptionEndsAt: string | null;
  isLifetimeAccess: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submittedQuestions: number;
  };
}

export interface AdminUsersTableFilters {
  search?: string;
  role?: string;
  status?: boolean;
  subscription?: string;
  page: number;
  limit: number;
}

export interface AdminUsersTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  subscriptionFilter?: string | null;
}

export interface AdminUsersTableEmits {
  (event: "view", user: User): void;
  (event: "edit", user: User): void;
  (event: "delete", user: User): void;
  (event: "page-change", event: { page: number; rows: number }): void;
}

