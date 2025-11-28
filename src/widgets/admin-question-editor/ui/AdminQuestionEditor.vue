<template>
  <div class="admin-question-editor">
    <div class="page-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          @click="$emit('cancel')"
          class="back-button"
        />
        <h1>{{ isNew ? "Создание вопроса" : "Редактирование вопроса" }}</h1>
      </div>
      <div class="header-actions">
        <Button
          label="Отмена"
          severity="secondary"
          @click="$emit('cancel')"
        />
        <Button
          :label="isNew ? 'Создать' : 'Сохранить'"
          :loading="saving"
          @click="saveQuestion"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <div v-else class="question-form-container">
      <div class="form-card">
        <AdminQuestionForm
          :model-value="questionForm"
          :selected-tags="selectedTags"
          @update:model-value="questionForm = $event"
          @update:selected-tags="selectedTags = $event"
        />

        <AdminQuestionAnswers
          :answers="questionAnswers"
          @update:answers="questionAnswers = $event"
        />

        <div v-if="!isNew && question" class="form-meta">
          <div class="meta-item">
            <span class="meta-label">Дата создания:</span>
            <span class="meta-value">{{ formatDate(question.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Последнее обновление:</span>
            <span class="meta-value">{{ formatDate(question.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AdminQuestionForm } from "@features/admin-question-form";
import { AdminQuestionAnswers } from "@features/admin-question-answers";
import { useAdminQuestionEditor } from "../model/useAdminQuestionEditor";
import type { AdminQuestionEditorProps, AdminQuestionEditorEmits } from "../model/types";

const props = defineProps<AdminQuestionEditorProps>();
const emit = defineEmits<AdminQuestionEditorEmits>();

const {
  isNew,
  question,
  loading,
  saving,
  questionForm,
  selectedTags,
  questionAnswers,
  saveQuestion,
  formatDate,
} = useAdminQuestionEditor(props.questionId, emit);
</script>

<style scoped src="../style/admin-question-editor.css"></style>

