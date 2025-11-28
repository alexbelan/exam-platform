<template>
  <div class="admin-question-answers">
    <h3>Ответы</h3>

    <div class="add-answer-section">
      <AutoComplete
        v-model="answerInput"
        :suggestions="answerSuggestions"
        optionLabel="text"
        placeholder="Введите текст ответа для поиска"
        :loading="answersLoading"
        @complete="onAnswerComplete"
        @item-select="handleAnswerSelect"
        @keyup.enter.prevent="createAnswerFromInput"
        class="answer-autocomplete"
      >
        <template #empty>
          <div class="autocomplete-empty">
            {{
              answerSearchTerm
                ? `Ответ "${answerSearchTerm}" не найден`
                : "Начните вводить текст ответа"
            }}
          </div>
        </template>
      </AutoComplete>

      <div class="add-answer-actions">
        <Button
          icon="pi pi-plus"
          label="Создать ответ"
          text
          :disabled="!canCreateAnswer"
          @click="createAnswerFromInput"
        />
      </div>
    </div>

    <div class="answers-table-wrapper">
      <Table
        :data="props.answers"
        :columns="answerColumns"
        :empty-message="'Нет ответов. Добавьте ответы выше.'"
      >
        <template #column-answer.text="{ value }">
          <span>{{ value || "" }}</span>
        </template>

        <template #column-isCorrect="{ data }">
          <Checkbox
            :modelValue="data.isCorrect"
            :binary="true"
            @update:modelValue="toggleCorrectAnswer(data)"
          />
        </template>

        <template #actions="{ data }">
          <div class="answer-correct-cell">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              v-tooltip.top="'Удалить ответ'"
              @click="handleRemoveAnswer(data)"
            />
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import AutoComplete from "primevue/autocomplete";
import Checkbox from "primevue/checkbox";
import { Table } from "@shared/ui";
import type { TableColumn } from "@shared/ui/Table";
import { useAdminQuestionAnswers } from "../model/useAdminQuestionAnswers";
import type { AdminQuestionAnswersProps, AdminQuestionAnswersEmits, QuestionAnswer } from "../model/types";

const props = defineProps<AdminQuestionAnswersProps>();
const emit = defineEmits<AdminQuestionAnswersEmits>();

const confirm = useConfirm();

const answerColumns: TableColumn<QuestionAnswer>[] = [
  {
    field: "answer.text",
    header: "Текст ответа",
    sortable: true,
  },
  {
    field: "isCorrect",
    header: "Правильный ответ",
    sortable: true,
    style: "width: 150px; text-align: center;",
  },
];

const questionAnswers = computed({
  get: () => props.answers,
  set: (value) => emit("update:answers", value),
});

const {
  answerInput,
  answerSuggestions,
  answersLoading,
  answerSearchTerm,
  canCreateAnswer,
  onAnswerComplete,
  handleAnswerSelect,
  createAnswerFromInput,
  toggleCorrectAnswer,
  removeAnswer,
} = useAdminQuestionAnswers(questionAnswers, emit);

const handleRemoveAnswer = (questionAnswer: QuestionAnswer) => {
  confirm.require({
    message: `Удалить ответ "${questionAnswer.answer.text}"?`,
    header: "Подтверждение",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Удалить",
    rejectLabel: "Отмена",
    acceptClass: "p-button-danger",
    accept: () => removeAnswer(questionAnswer),
  });
};
</script>

<style scoped src="../style/admin-question-answers.css"></style>

