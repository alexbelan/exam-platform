<template>
  <div class="test-question">
    <div class="test-question__header">
      <TestProgress :current="currentIndex + 1" :total="totalQuestions" />
      <Button
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        v-tooltip.top="'Завершить тест'"
        @click="$emit('end')"
      />
    </div>

    <div v-if="pending" class="test-question__loading">
      <ProgressSpinner strokeWidth="4" />
      <p>Загрузка вопроса...</p>
    </div>

    <div v-else-if="error" class="test-question__error">
      <p>Ошибка при загрузке вопроса</p>
      <Button
        label="Попробовать снова"
        icon="pi pi-refresh"
        @click="handleRetry"
      />
    </div>

    <div v-else-if="question" class="test-question__content">
      <h2 class="test-question__title">{{ question.title }}</h2>

      <div class="test-question__answers">
        <AnswerOption
          v-for="questionAnswer in question.questionAnswers"
          :key="questionAnswer.id"
          :answer="questionAnswer.answer"
          :type="questionType"
          :name="questionName"
          :is-selected="selectedAnswers.has(questionAnswer.answer.id)"
          @change="handleAnswerChange"
        />
      </div>

      <div class="test-question__actions">
        <Button
          v-if="currentIndex > 0"
          label="Предыдущий"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="$emit('previous')"
        />
        <div class="test-question__nav-spacer"></div>
        <Button
          v-if="currentIndex < totalQuestions - 1"
          label="Следующий"
          icon="pi pi-arrow-right"
          iconPos="right"
          :disabled="!canProceed"
          @click="$emit('next')"
        />
        <Button
          v-else
          label="Завершить тест"
          icon="pi pi-check"
          iconPos="right"
          severity="success"
          :disabled="!canProceed"
          @click="$emit('end')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { TestProgress } from "@entities/test-progress";
import { AnswerOption } from "@entities/answer-option";
import { useTestQuestion } from "../model/useTestQuestion";
import type { TestQuestionProps } from "../model/types";

const props = defineProps<TestQuestionProps>();

const emit = defineEmits<{
  (
    event: "answer-change",
    answerId: number,
    evt: Event,
    questionId: number,
    questionType: "radio" | "checkbox"
  ): void;
  (event: "next"): void;
  (event: "previous"): void;
  (event: "end"): void;
  (event: "retry"): void;
}>();

const {
  question,
  pending,
  error,
  questionName,
  questionType,
  canProceed,
  handleAnswerChange,
  handleRetry,
} = useTestQuestion(props, {
  onAnswerChange: (answerId, evt, questionId, questionType) => {
    emit("answer-change", answerId, evt, questionId, questionType);
  },
  onRetry: () => {
    emit("retry");
  },
});
</script>

<style scoped src="../style/test-question.css"></style>
