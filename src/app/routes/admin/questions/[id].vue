<template>
  <div class="question-detail">
    <div class="page-header">
      <div class="header-left">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          @click="navigateTo('/admin/questions')"
          class="back-button"
        />
        <h1>{{ isNew ? "Создание вопроса" : "Редактирование вопроса" }}</h1>
      </div>
      <div class="header-actions">
        <Button
          label="Отмена"
          severity="secondary"
          @click="navigateTo('/admin/questions')"
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
        <FormInput
          v-model="questionForm.title"
          label="Заголовок"
          required
          placeholder="Введите заголовок вопроса"
        />

        <TextEditor
          v-model="questionForm.content"
          label="Содержание"
          required
        />

        <FormAutoComplete
          v-model="selectedTags"
          label="Теги"
          multiple
          optionLabel="name"
          placeholder="Введите название тега для поиска"
          :completeMethod="searchTags"
          preventDuplicates
        />

        <FormCheckbox
          v-model="questionForm.isPublished"
          label="Опубликовать вопрос"
        />

        <FormCheckbox
          v-model="questionForm.requiresPremium"
          label="Требуется премиум подписка"
        />

        <div class="answers-section">
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

          <!-- Таблица ответов -->
          <div class="answers-table-wrapper">
            <Table
              :data="questionAnswers"
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
                    @click="removeAnswer(data)"
                  />
                </div>
              </template>
            </Table>
          </div>
        </div>

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
import { useToastClient } from "@shared/hooks/useToastClient";
import {
  TextEditor,
  FormAutoComplete,
  FormInput,
  FormCheckbox,
  Table,
} from "@shared/ui";
import type { TableColumn } from "@shared/ui/Table";
import Checkbox from "primevue/checkbox";
import AutoComplete from "primevue/autocomplete";
import { useConfirm } from "primevue/useconfirm";

// Используем middleware для проверки прав администратора
definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

// Типы
interface Answer {
  id: number;
  text: string;
}

interface QuestionAnswer {
  id: number;
  answerId: number;
  answer: Answer;
  isCorrect: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category?: Category | null;
}

interface Question {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  requiresPremium?: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number | null;
  tags?: Tag[];
  questionAnswers?: QuestionAnswer[];
}

// Инициализируем Toast
const toast = useToastClient();
const confirm = useConfirm();

// Получаем ID из маршрута
const route = useRoute();
const questionId = route.params.id as string;
const isNew = questionId === "new";

// Реактивные данные
const question = ref<Question | null>(null);
const loading = ref(true);
const saving = ref(false);
const selectedTags = ref<Tag[]>([]);

const questionForm = ref({
  title: "",
  content: "",
  isPublished: false,
  requiresPremium: false,
  categoryId: null as number | null,
});

// Реактивные данные для ответов
const questionAnswers = ref<QuestionAnswer[]>([]);
const answerInput = ref<Answer | string | null>(null);
const answerSuggestions = ref<Answer[]>([]);
const answersLoading = ref(false);
const answerSearchTerm = ref("");

const canCreateAnswer = computed(() => {
  const value = answerInput.value;
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return answerSearchTerm.value.trim().length > 0;
});

// Колонки таблицы ответов
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

// Загрузка вопроса
const fetchQuestion = async () => {
  if (isNew) {
    loading.value = false;
    questionAnswers.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await $fetch<{ success: boolean; question: Question }>(
      `/api/questions/${questionId}`
    );
    if (!response.question) {
      throw new Error("Вопрос не найден");
    }
    question.value = response.question;
    questionForm.value = {
      title: question.value.title,
      content: question.value.content,
      isPublished: question.value.isPublished,
      requiresPremium: question.value.requiresPremium ?? false,
      categoryId: question.value.categoryId ?? null,
    };
    selectedTags.value = question.value.tags || [];

    // Загружаем ответы
    if (question.value.questionAnswers) {
      questionAnswers.value = question.value.questionAnswers.map((qa) => ({
        id: qa.id,
        answerId: qa.answer.id,
        answer: qa.answer,
        isCorrect: qa.isCorrect,
      }));
    } else {
      questionAnswers.value = [];
    }
  } catch (error) {
    console.error("Ошибка при загрузке вопроса:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось загрузить вопрос",
    });
    navigateTo("/admin/questions");
  } finally {
    loading.value = false;
  }
};

// Поиск тегов через API
const searchTags = async (query: string): Promise<Tag[]> => {
  try {
    const response = await $fetch<{ tags: Tag[] }>("/api/tags", {
      query: { search: query },
    });
    return response.tags;
  } catch (error) {
    console.error("Ошибка при поиске тегов:", error);
    return [];
  }
};

// Поиск ответов через API
const searchAnswers = async (query: string): Promise<Answer[]> => {
  try {
    const response = await $fetch<{ answers: Answer[] }>("/api/answers", {
      query: { search: query },
    });
    // Исключаем уже добавленные ответы
    const existingAnswerIds = questionAnswers.value.map((qa) => qa.answerId);
    return response.answers.filter((a) => !existingAnswerIds.includes(a.id));
  } catch (error) {
    console.error("Ошибка при поиске ответов:", error);
    return [];
  }
};

const addAnswerToQuestion = (answer: Answer) => {
  const exists = questionAnswers.value.some((qa) => qa.answerId === answer.id);

  if (exists) {
    toast.add({
      severity: "warn",
      summary: "Предупреждение",
      detail: "Этот ответ уже добавлен",
    });
    return;
  }

  questionAnswers.value.push({
    id: `temp-${Date.now()}`,
    answerId: answer.id,
    answer,
    isCorrect: false,
  });

  answerInput.value = null;
  answerSearchTerm.value = "";
  answerSuggestions.value = [];
};

const onAnswerComplete = async (event: { query: string }) => {
  answerSearchTerm.value = event.query;
  answersLoading.value = true;
  try {
    answerSuggestions.value = await searchAnswers(event.query);
  } finally {
    answersLoading.value = false;
  }
};

const handleAnswerSelect = (event: { value: Answer }) => {
  if (event?.value) {
    addAnswerToQuestion(event.value);
  }
};

// Создание нового ответа через API
const createAnswer = async (text: string): Promise<Answer> => {
  try {
    const response = await $fetch<{ success: boolean; answer: Answer }>(
      "/api/answers",
      {
        method: "POST",
        body: { text },
      }
    );

    console.log("response", response);

    if (response.success && response.answer) {
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: `Ответ "${response.answer.text}" создан`,
      });
      return response.answer;
    }

    throw new Error("Не удалось создать ответ");
  } catch (error) {
    console.error("Ошибка при создании ответа:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: `Не удалось создать ответ "${text}"`,
    });
    throw error;
  }
};

const createAnswerFromInput = async () => {
  const rawValue = answerInput.value;
  const textCandidate =
    typeof rawValue === "string"
      ? rawValue
      : answerSearchTerm.value || rawValue?.text || "";

  const text = textCandidate.trim();

  if (!text) {
    toast.add({
      severity: "warn",
      summary: "Предупреждение",
      detail: "Введите текст ответа, чтобы создать его",
    });
    return;
  }

  const duplicateInQuestion = questionAnswers.value.some(
    (qa) => qa.answer.text.trim().toLowerCase() === text.toLowerCase()
  );

  if (duplicateInQuestion) {
    toast.add({
      severity: "warn",
      summary: "Предупреждение",
      detail: "Этот ответ уже добавлен",
    });
    return;
  }

  const existingSuggestion = answerSuggestions.value.find(
    (suggestion) => suggestion.text.trim().toLowerCase() === text.toLowerCase()
  );

  if (existingSuggestion) {
    addAnswerToQuestion(existingSuggestion);
    return;
  }

  try {
    const newAnswer = await createAnswer(text);
    addAnswerToQuestion(newAnswer);
  } catch (error) {
    // Ошибка уже обработана в createAnswer
  }
};

// Переключение правильного ответа
const toggleCorrectAnswer = (questionAnswer: QuestionAnswer) => {
  const index = questionAnswers.value.findIndex(
    (qa) => qa.answerId === questionAnswer.answerId
  );
  if (index !== -1 && questionAnswers.value[index]) {
    questionAnswers.value[index].isCorrect =
      !questionAnswers.value[index].isCorrect;
  }
};

// Удаление ответа из вопроса
const doRemoveAnswer = (questionAnswer: QuestionAnswer) => {
  questionAnswers.value = questionAnswers.value.filter(
    (qa) => qa.answerId !== questionAnswer.answerId
  );
  toast.add({
    severity: "info",
    summary: "Удалено",
    detail: `Ответ "${questionAnswer.answer.text}" удалён`,
  });
};

const removeAnswer = (questionAnswer: QuestionAnswer) => {
  confirm.require({
    message: `Удалить ответ "${questionAnswer.answer.text}"?`,
    header: "Подтверждение",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Удалить",
    rejectLabel: "Отмена",
    acceptClass: "p-button-danger",
    accept: () => doRemoveAnswer(questionAnswer),
  });
};

// Сохранение вопроса
const saveQuestion = async () => {
  if (!questionForm.value.title || !questionForm.value.content) {
    toast.add({
      severity: "warn",
      summary: "Предупреждение",
      detail: "Заголовок и содержание обязательны",
    });
    return;
  }

  saving.value = true;
  try {
    // Преобразуем ответы для отправки на сервер
    const answersPayload = questionAnswers.value.map((qa) => ({
      id: qa.answerId,
      isCorrect: qa.isCorrect,
    }));

    // Преобразуем теги для отправки на сервер
    const payload = {
      ...questionForm.value,
      tags: selectedTags.value
        .map((tag) => tag?.id || tag?.slug)
        .filter(Boolean),
      answers: answersPayload,
    };

    if (isNew) {
      await $fetch("/api/questions", {
        method: "POST",
        body: payload,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Вопрос создан",
      });
    } else {
      await $fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        body: payload,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Вопрос обновлен",
      });
    }

    navigateTo("/admin/questions");
  } catch (error) {
    console.error("Ошибка при сохранении вопроса:", error);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: isNew
        ? "Не удалось создать вопрос"
        : "Не удалось обновить вопрос",
    });
  } finally {
    saving.value = false;
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// Загрузка данных при монтировании
onMounted(() => {
  fetchQuestion();
});
</script>

<style scoped>
.question-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  margin-right: 0.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.question-form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-textarea,
.form-dropdown {
  width: 100%;
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-meta {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 150px;
}

.meta-value {
  color: #2c3e50;
}

.answers-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.answers-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.add-answer-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answers-table-wrapper {
  margin-top: 1rem;
}

.answer-autocomplete :deep(.p-autocomplete-input) {
  width: 100%;
}

.add-answer-actions {
  display: flex;
  justify-content: flex-start;
}

.autocomplete-empty {
  padding: 0.5rem 0.75rem;
  color: #6c757d;
}

.answer-correct-cell {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .header-actions button {
    flex: 1;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .question-form-container {
    padding: 1.5rem;
  }

  .meta-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .meta-label {
    min-width: auto;
  }
}
</style>
