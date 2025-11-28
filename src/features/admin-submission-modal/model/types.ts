import type { Submission } from "@features/admin-submissions-table";

export interface AdminSubmissionModalProps {
  visible: boolean;
  submission: Submission | null;
}

export interface AdminSubmissionModalEmits {
  (event: "update:visible", value: boolean): void;
  (event: "approve", submission: Submission): void;
  (event: "reject", submission: Submission): void;
}

