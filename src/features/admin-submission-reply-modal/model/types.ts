import type { Submission } from "@features/admin-submissions-table";

export interface AdminSubmissionReplyModalProps {
  visible: boolean;
  submission: Submission | null;
}

export interface AdminSubmissionReplyModalEmits {
  (event: "update:visible", value: boolean): void;
  (
    event: "send",
    data: { submission: Submission; reply: string; sendEmail: boolean }
  ): void;
}
