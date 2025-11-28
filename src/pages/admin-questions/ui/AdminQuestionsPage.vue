<template>
  <div class="admin-questions-page">
    <AdminQuestionsCatalog
      @open="openQuestion"
      @create="createQuestion"
      @import="importQuestions"
      @view="viewQuestion"
      @toggle-publish="handleTogglePublish"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { AdminQuestionsCatalog } from "@widgets/admin-questions-catalog";
import { useAdminQuestionsPage } from "../model/useAdminQuestionsPage";
import type { Question } from "@features/questions-table";

const { openQuestion, createQuestion, importQuestions, viewQuestion } =
  useAdminQuestionsPage();

const handleTogglePublish = (question: Question) => {
  // Логика уже обрабатывается в виджете
};

const handleDelete = (question: Question) => {
  // Логика уже обрабатывается в виджете
};
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

