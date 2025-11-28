<template>
  <div class="test-taking">
    <Card class="test-taking__card">
      <template #content>
        <!-- Загрузка/Ошибка -->
        <div v-if="pending">
          <p>Загрузка теста...</p>
        </div>

        <div v-else-if="error">
          <p class="test-taking__error">Ошибка при загрузке теста</p>
          <Button
            label="Вернуться к списку тестов"
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="goBack"
          />
        </div>

        <!-- Результаты -->
        <TestResults
          v-else-if="testData && showResults"
          :test-name="testData.test.name"
          :correct-answers="correctAnswers"
          :total-questions="testData.questions.length"
          :question-results="questionResults"
          :question-ids="testData.questions"
          @restart="restartTest"
        />

        <!-- Превью -->
        <TestPreview
          v-else-if="testData && !isTestStarted && !showResults"
          :test-id="testId"
          :test="{
            id: testId,
            name: testData.test.name,
            description: testData.test.description,
            tags: testData.test.tags,
            primaryTag: testData.test.primaryTag,
            questionsCount: testData.questions.length,
          }"
          :tags="allTags"
          @start="startTest"
        />

        <!-- Прохождение -->
        <TestQuestion
          v-else-if="testData && isTestStarted && !showResults"
          :question-id="currentQuestionId"
          :current-index="currentQuestionIndex"
          :total-questions="testData.questions.length"
          :selected-answers="selectedAnswers"
          @answer-change="handleAnswerChangeWithContext"
          @next="goToNextQuestion"
          @previous="goToPreviousQuestion"
          @end="endTest"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { TestPreview } from "@features/test-preview";
import { TestQuestion } from "@features/test-question";
import { TestResults } from "@features/test-results";
import { useTestTaking } from "../model/useTestTaking";

interface Props {
  testId: string | number;
}

const props = defineProps<Props>();

const {
  testData,
  pending,
  error,
  isTestStarted,
  showResults,
  currentQuestionIndex,
  currentQuestionId,
  selectedAnswers,
  correctAnswers,
  questionResults,
  allTags,
  handleAnswerChange,
  startTest,
  endTest,
  restartTest,
  goToNextQuestion,
  goToPreviousQuestion,
} = useTestTaking(props.testId);

const handleAnswerChangeWithContext = (
  answerId: number,
  event: Event,
  questionId: number,
  questionType: "radio" | "checkbox"
) => {
  handleAnswerChange(answerId, event, questionId, questionType);
};

const goBack = () => {
  if (isTestStarted.value) {
    if (confirm("Вы уверены, что хотите выйти? Прогресс будет потерян.")) {
      navigateTo("/workspace/tests");
    }
  } else {
    navigateTo("/workspace/tests");
  }
};
</script>

<style scoped src="../style/test-taking.css"></style>
