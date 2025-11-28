<template>
  <div class="admin-submissions-page">
    <AdminSubmissionsCatalog
      @view="handleView"
      @approve="handleApprove"
      @reject="handleReject"
      @reply="handleReplyClick"
    />

    <SubmissionModal
      :visible="showSubmissionModal"
      :submission="selectedSubmission"
      @update:visible="showSubmissionModal = $event"
      @approve="handleApprove"
      @reject="handleReject"
    />

  </div>
</template>

<script setup lang="ts">
import { AdminSubmissionsCatalog } from "@widgets/admin-submissions-catalog";
import { SubmissionModal } from "@features/submission-modal";
import { useAdminSubmissionsPage } from "../model/useAdminSubmissionsPage";
import type { Submission } from "@features/submissions-table";

const {
  showSubmissionModal,
  selectedSubmission,
  openSubmissionModal,
  handleApprove,
  handleReject,
} = useAdminSubmissionsPage();

const handleView = (submission: Submission) => {
  openSubmissionModal(submission);
};

const handleReplyClick = (submission: Submission) => {
  // Reply functionality removed
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

