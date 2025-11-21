<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '90vw', maxWidth: '600px' }"
    :closable="true"
    class="test-results-details-modal"
    @hide="handleClose"
  >
    <template #header>
      <h3>Результаты теста</h3>
    </template>

    <div class="test-results-details-modal__content">
      <!-- Фильтр -->
      <div class="test-results-details-modal__filter">
        <SelectButton
          v-model="selectedFilters"
          :options="filterOptions"
          optionLabel="label"
          optionValue="value"
          multiple
          class="test-results-details-modal__filter-buttons"
        />
      </div>

      <!-- Список вопросов -->
      <div class="test-results-details-modal__list">
        <div
          v-for="questionId in filteredQuestionIds"
          :key="questionId"
          class="test-results-details-modal__item"
          :class="{
            'test-results-details-modal__item--correct':
              props.getQuestionStatus(questionId) === 'correct',
            'test-results-details-modal__item--incorrect':
              props.getQuestionStatus(questionId) === 'incorrect',
            'test-results-details-modal__item--partial':
              props.getQuestionStatus(questionId) === 'partial',
          }"
        >
          <div class="test-results-details-modal__item-content">
            <div class="test-results-details-modal__item-number">
              {{ getQuestionNumber(questionId) }}
            </div>
            <div class="test-results-details-modal__item-info">
              <div
                v-if="props.isQuestionLoading(questionId)"
                class="test-results-details-modal__loading"
              >
                <ProgressSpinner strokeWidth="4" />
                <span>Загрузка...</span>
              </div>
              <div
                v-else-if="props.getQuestion(questionId)"
                class="test-results-details-modal__title"
              >
                {{ props.getQuestion(questionId)?.title }}
              </div>
              <div v-else class="test-results-details-modal__error">
                Вопрос #{{ questionId }}
              </div>
            </div>
            <div class="test-results-details-modal__status-icon">
              <i
                v-if="props.getQuestionStatus(questionId) === 'correct'"
                v-tooltip.top="'Правильно'"
                class="pi pi-check-circle test-results-details-modal__icon--correct"
              ></i>
              <i
                v-else-if="props.getQuestionStatus(questionId) === 'partial'"
                v-tooltip.top="'Частично правильно'"
                class="pi pi-exclamation-circle test-results-details-modal__icon--partial"
              ></i>
              <i
                v-else
                v-tooltip.top="'Неправильно'"
                class="pi pi-times-circle test-results-details-modal__icon--incorrect"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Dialog from "primevue/dialog";
import SelectButton from "primevue/selectbutton";
import ProgressSpinner from "primevue/progressspinner";
import type { QuestionResult } from "../model/types";

interface Props {
  visible: boolean;
  questionResults: Map<number, QuestionResult>;
  questionIds: number[];
  getQuestionResult: (questionId: number) => QuestionResult | undefined;
  getQuestionStatus: (
    questionId: number
  ) => "correct" | "incorrect" | "partial";
  getQuestion: (questionId: number) => any;
  isQuestionLoading: (questionId: number) => boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

// Состояние видимости модалки
const isVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      handleClose();
    }
  },
});

// Опции фильтра
const filterOptions = [
  { label: "Правильные", value: "correct" },
  { label: "Неправильные", value: "incorrect" },
  { label: "Частично правильные", value: "partial" },
];

// Выбранные фильтры (по умолчанию все выключены - показываем все)
const selectedFilters = ref<string[]>([]);

// Отфильтрованные ID вопросов
const filteredQuestionIds = computed(() => {
  // Если ничего не выбрано - показываем все вопросы
  if (selectedFilters.value.length === 0) {
    return props.questionIds;
  }

  // Если что-то выбрано - фильтруем по выбранным статусам
  return props.questionIds.filter((questionId) => {
    const status = props.getQuestionStatus(questionId);
    return selectedFilters.value.includes(status);
  });
});

// Получить номер вопроса в исходном списке
const getQuestionNumber = (questionId: number): number => {
  return props.questionIds.indexOf(questionId) + 1;
};

// Обработка закрытия модалки
const handleClose = () => {
  emit("close");
};
</script>

<style scoped src="../style/test-results-details-modal.css"></style>
