export interface SubmissionUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  status: string;
  adminResponse: string | null;
  isResponseSent: boolean;
  createdAt: Date;
  user: SubmissionUser;
}

export interface AdminSubmissionsTableProps {
  submissions: Submission[];
  loading: boolean;
  selectedSubmissions: Submission[];
}

export interface AdminSubmissionsTableEmits {
  (event: "update:selectedSubmissions", submissions: Submission[]): void;
  (event: "view", submission: Submission): void;
  (event: "approve", submission: Submission): void;
  (event: "reject", submission: Submission): void;
  (event: "reply", submission: Submission): void;
}

