<template>
  <div class="admin-submissions-page">
    <AdminSubmissionsCatalog
      @view="handleView"
      @approve="handleApprove"
      @reject="handleReject"
      @reply="handleReplyClick"
    />

    <AdminSubmissionModal
      :visible="showSubmissionModal"
      :submission="selectedSubmission"
      @update:visible="showSubmissionModal = $event"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <AdminSubmissionReplyModal
      :visible="showReplyModal"
      :submission="selectedSubmission"
      @update:visible="showReplyModal = $event"
      @send="handleReplySend"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminSubmissionsCatalog } from "@widgets/admin-submissions-catalog";
import { AdminSubmissionModal } from "@features/admin-submission-modal";
import { AdminSubmissionReplyModal } from "@features/admin-submission-reply-modal";
import { useAdminSubmissionsPage } from "../model/useAdminSubmissionsPage";
import type { Submission } from "@features/admin-submissions-table";

const {
  showSubmissionModal,
  showReplyModal,
  selectedSubmission,
  openSubmissionModal,
  closeSubmissionModal,
  openReplyModal,
  handleApprove,
  handleReject,
  handleReply,
} = useAdminSubmissionsPage();

const handleView = (submission: Submission) => {
  openSubmissionModal(submission);
};

const handleReplyClick = (submission: Submission) => {
  openReplyModal(submission);
};

const handleReplySend = (data: { submission: Submission; reply: string; sendEmail: boolean }) => {
  handleReply(data);
};
</script>

<style scoped>
.admin-submissions-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

