<template>
  <div class="admin-submissions-page">
    <div class="admin-submissions-catalog">
      <div class="page-header">
        <h1>Заявки пользователей</h1>
        <div class="header-actions">
          <Button
            label="Экспорт"
            icon="pi pi-download"
            severity="secondary"
            @click="exportSubmissions"
          />
          <Button
            label="Массовые действия"
            icon="pi pi-check-square"
            severity="info"
            @click="showBulkActions = true"
          />
        </div>
      </div>

      <SubmissionsFilters
        :model-value="filtersForComponent"
        @update:model-value="handleFiltersChange"
        @reset="handleFiltersReset"
      />

      <SubmissionsTable
        :submissions="submissions"
        :loading="loading"
        :selected-submissions="selectedSubmissions"
        @update:selected-submissions="selectedSubmissions = $event"
        @view="handleView"
        @approve="handleApprove"
        @reject="handleReject"
        @reply="handleReplyClick"
      />
    </div>

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
import { ref } from "vue";
import { SubmissionsFilters } from "@features/submissions-filters";
import { SubmissionsTable } from "@features/submissions-table";
import { SubmissionModal } from "@features/submission-modal";
import { useAdminSubmissionsCatalog } from "../model/useAdminSubmissionsCatalog";
import { useAdminSubmissionsPage } from "../model/useAdminSubmissionsPage";
import type { Submission } from "@features/submissions-table";

const showBulkActions = ref(false);

const {
  loading,
  submissions,
  selectedSubmissions,
  filtersForComponent,
  handleFiltersChange,
  handleFiltersReset,
  exportSubmissions,
} = useAdminSubmissionsCatalog();

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

const handleReplyClick = () => {
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

<style scoped src="../style/admin-submissions-catalog.css"></style>
