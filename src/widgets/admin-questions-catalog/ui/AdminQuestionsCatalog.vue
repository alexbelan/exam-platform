<template>
  <div class="admin-questions-catalog">
    <div class="page-header">
      <h1>Управление вопросами</h1>
      <div class="header-actions">
        <Button
          label="Добавить вопрос"
          icon="pi pi-plus"
          @click="$emit('create')"
        />
        <Button
          label="Импорт"
          icon="pi pi-upload"
          severity="secondary"
          @click="$emit('import')"
        />
      </div>
    </div>

    <AdminQuestionsFilters
      :model-value="{ search: filters.search, status: filters.status }"
      @update:model-value="handleFiltersUpdate"
      @reset="handleFiltersReset"
    />

    <AdminQuestionsTable
      :questions="questions"
      :pagination="pagination"
      :loading="loading"
      :columns="columns"
      @view="handleView"
      @toggle-publish="handleTogglePublish"
      @delete="handleDelete"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminQuestionsFilters } from "@features/admin-questions-filters";
import { AdminQuestionsTable } from "@features/admin-questions-table";
import { useAdminQuestionsCatalog } from "../model/useAdminQuestionsCatalog";
import type { Question } from "@features/admin-questions-table";

const emit = defineEmits<{
  (event: "open", id: number): void;
  (event: "create"): void;
  (event: "import"): void;
  (event: "view", question: Question): void;
  (event: "toggle-publish", question: Question): void;
  (event: "delete", question: Question): void;
}>();

const {
  filters,
  questions,
  pagination,
  loading,
  columns,
  handleView,
  handleTogglePublish,
  handleDelete,
  handlePageChange,
  handleFiltersUpdate,
  handleFiltersReset,
} = useAdminQuestionsCatalog(emit);
</script>

<style scoped src="../style/admin-questions-catalog.css"></style>

