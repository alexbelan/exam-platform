import { ref } from "vue";
import type { Submission } from "@features/admin-submissions-table";

export function useAdminSubmissionsPage() {
  const showSubmissionModal = ref(false);
  const showReplyModal = ref(false);
  const selectedSubmission = ref<Submission | null>(null);

  const openSubmissionModal = (submission: Submission) => {
    selectedSubmission.value = submission;
    showSubmissionModal.value = true;
  };

  const closeSubmissionModal = () => {
    showSubmissionModal.value = false;
    selectedSubmission.value = null;
  };

  const openReplyModal = (submission: Submission) => {
    selectedSubmission.value = submission;
    showReplyModal.value = true;
  };

  const closeReplyModal = () => {
    showReplyModal.value = null;
    showReplyModal.value = false;
  };

  const handleApprove = (submission: Submission) => {
    submission.status = "APPROVED";
    console.log("Одобрение заявки:", submission);
    closeSubmissionModal();
  };

  const handleReject = (submission: Submission) => {
    submission.status = "REJECTED";
    console.log("Отклонение заявки:", submission);
    closeSubmissionModal();
  };

  const handleReply = (data: { submission: Submission; reply: string; sendEmail: boolean }) => {
    if (data.submission) {
      data.submission.adminResponse = data.reply;
      data.submission.isResponseSent = data.sendEmail;
      console.log("Отправка ответа:", data);
    }
    closeReplyModal();
  };

  return {
    showSubmissionModal,
    showReplyModal,
    selectedSubmission,
    openSubmissionModal,
    closeSubmissionModal,
    openReplyModal,
    closeReplyModal,
    handleApprove,
    handleReject,
    handleReply,
  };
}

