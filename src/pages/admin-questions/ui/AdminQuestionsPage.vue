<template>
  <div class="admin-questions-page">
    <div class="admin-questions-catalog">
      <div class="page-header">
        <h1>Управление вопросами</h1>
        <div class="header-actions">
          <Button
            label="Добавить вопрос"
            icon="pi pi-plus"
            @click="createQuestion"
          />
          <Button
            label="Импорт"
            icon="pi pi-upload"
            severity="secondary"
            @click="importQuestions"
          />
        </div>
      </div>

      <QuestionsFilters
        :model-value="filtersForComponent"
        @update:model-value="handleFiltersUpdate"
        @reset="handleFiltersReset"
      />

      <QuestionsTable
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
  </div>
</template>

<script setup lang="ts">
import { QuestionsFilters } from "@features/questions-filters";
import { QuestionsTable } from "@features/questions-table";
import { useAdminQuestionsCatalog } from "../model/useAdminQuestionsCatalog";
import { useAdminQuestionsPage } from "../model/useAdminQuestionsPage";
import type { Question } from "@features/questions-table";

const { createQuestion, importQuestions } = useAdminQuestionsPage();

const emit = defineEmits<{
  (event: "open", id: number): void;
  (event: "create" | "import"): void;
  (event: "view" | "toggle-publish" | "delete", question: Question): void;
}>();

const {
  filtersForComponent,
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

<style scoped>
.admin-questions-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/admin-questions-catalog.css"></style>
