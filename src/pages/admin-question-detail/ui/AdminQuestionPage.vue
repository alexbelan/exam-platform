<template>
  <div class="admin-question-editor">
    <div class="page-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          class="back-button"
          @click="handleCancel"
        />
        <h1>{{ isNew ? "Создание вопроса" : "Редактирование вопроса" }}</h1>
      </div>
      <div class="header-actions">
        <Button label="Отмена" severity="secondary" @click="handleCancel" />
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
        <QuestionForm
          :model-value="questionForm"
          :selected-tags="selectedTags"
          @update:model-value="questionForm = $event"
          @update:selected-tags="selectedTags = $event"
        />

        <QuestionAnswers
          :answers="questionAnswers"
          @update:answers="questionAnswers = $event"
        />

        <div v-if="!isNew && question" class="form-meta">
          <div class="meta-item">
            <span class="meta-label">Дата создания:</span>
            <span class="meta-value">{{
              formatDate(question.createdAt, "datetime")
            }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Последнее обновление:</span>
            <span class="meta-value">{{
              formatDate(question.updatedAt, "datetime")
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionForm } from "@features/question-form";
import { QuestionAnswers } from "@features/question-answers";
import { formatDate } from "@shared/utils";
import { useAdminQuestionEditor } from "../model/useAdminQuestionEditor";
import { useAdminQuestionPage } from "../model/useAdminQuestionPage";
import type { AdminQuestionEditorEmits } from "../model/types";

const route = useRoute();
const questionId = computed(() => route.params.id as string);

const { handleSave, handleCancel } = useAdminQuestionPage(questionId.value);

const emit = defineEmits<AdminQuestionEditorEmits>();

const {
  isNew,
  question,
  loading,
  saving,
  questionForm,
  selectedTags,
  questionAnswers,
  saveQuestion: saveQuestionEditor,
  getSaveData,
} = useAdminQuestionEditor(questionId.value, emit);

const saveQuestion = async () => {
  await saveQuestionEditor();
  if (!saving.value) {
    await handleSave(getSaveData());
  }
};
</script>

<style scoped src="../style/admin-question-editor.css"></style>
