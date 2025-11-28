<template>
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

    <AdminSubmissionsFilters
      :model-value="filters"
      @update:model-value="handleFiltersUpdate"
      @reset="handleFiltersReset"
    />

    <AdminSubmissionsTable
      :submissions="submissions"
      :loading="loading"
      :selected-submissions="selectedSubmissions"
      @update:selectedSubmissions="selectedSubmissions = $event"
      @view="$emit('view', $event)"
      @approve="$emit('approve', $event)"
      @reject="$emit('reject', $event)"
      @reply="$emit('reply', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { AdminSubmissionsFilters } from "@features/admin-submissions-filters";
import { AdminSubmissionsTable } from "@features/admin-submissions-table";
import { useAdminSubmissionsCatalog } from "../model/useAdminSubmissionsCatalog";
import type { Submission } from "@features/admin-submissions-table";

const emit = defineEmits<{
  (event: "view", submission: Submission): void;
  (event: "approve", submission: Submission): void;
  (event: "reject", submission: Submission): void;
  (event: "reply", submission: Submission): void;
}>();

const showBulkActions = ref(false);

const {
  loading,
  filters,
  submissions,
  selectedSubmissions,
  handleFiltersUpdate,
  handleFiltersReset,
  exportSubmissions,
} = useAdminSubmissionsCatalog(emit);
</script>

<style scoped src="../style/admin-submissions-catalog.css"></style>

