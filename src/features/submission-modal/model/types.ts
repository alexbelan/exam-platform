import type { Submission } from "@features/submissions-table";

export interface SubmissionModalProps {
  visible: boolean;
  submission: Submission | null;
}

export interface SubmissionModalEmits {
  (event: "update:visible", value: boolean): void;
  (event: "approve", submission: Submission): void;
  (event: "reject", submission: Submission): void;
}

