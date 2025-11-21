<template>
  <div class="test-results">
    <div class="test-results__content">
      <div class="test-results__header">
        <h2 class="test-results__title">Результаты теста</h2>
        <p class="test-results__subtitle">{{ testName }}</p>
      </div>

      <div class="test-results__score">
        <div class="test-results__score-value">
          {{ correctAnswers }}/{{ totalQuestions }}
        </div>
        <div class="test-results__score-label">Правильных ответов</div>
      </div>

      <div class="test-results__actions">
        <Button
          v-if="!isPerfectScore"
          label="Перепройти этот тест"
          icon="pi pi-refresh"
          @click="$emit('restart')"
          class="test-results__restart-button"
        />
        <Button
          label="Разбор ответов"
          icon="pi pi-list-check"
          @click="openDetailsModal"
          class="test-results__details-button"
        />
        <Button
          label="Вернуться к списку тестов"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="goBack"
        />
      </div>
    </div>

    <TestResultsDetailsModal
      :visible="showDetailsModal"
      :question-results="props.questionResults"
      :question-ids="props.questionIds"
      :get-question-result="getQuestionResult"
      :get-question-status="getQuestionStatus"
      :get-question="getQuestion"
      :is-question-loading="isQuestionLoading"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { useTestResults } from "../model/useTestResults";
import TestResultsDetailsModal from "./TestResultsDetailsModal.vue";
import type { TestResultsProps } from "../model/types";

const props = defineProps<TestResultsProps>();

defineEmits<{
  (event: "restart"): void;
}>();

const {
  goBack,
  isPerfectScore,
  showDetailsModal,
  openDetailsModal,
  closeDetailsModal,
  getQuestionResult,
  getQuestionStatus,
  getQuestion,
  isQuestionLoading,
} = useTestResults(props);
</script>

<style scoped src="../style/test-results.css"></style>
