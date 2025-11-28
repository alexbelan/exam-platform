<template>
  <div class="question-details" v-if="question">
    <div class="question-header">
      <Button
        label="Назад к вопросам"
        icon="pi pi-arrow-left"
        text
        @click="navigateTo('/workspace/questions')"
      />
    </div>

    <h2>{{ question.title }}</h2>
    <p class="question-meta">
      <UiTag
        v-for="tag in question.tags"
        :key="tag.id"
        :label="tag.name"
        :color="tag.category?.color ?? undefined"
        size="sm"
        pill
        class="question-tag"
      />
    </p>

    <div class="question-body">
      <p v-if="question.description">{{ question.description }}</p>
      <div class="question-content" v-html="question.content" />
    </div>

    <div class="question-actions">
      <Button
        :label="bookmarked ? 'Удалить из сохраненных' : 'Сохранить вопрос'"
        :icon="bookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
        :severity="bookmarked ? 'success' : 'secondary'"
        outlined
        @click="toggleBookmark"
      />
      <Button
        label="Перейти к тесту по теме"
        icon="pi pi-list-check"
        severity="secondary"
        text
        @click="navigateTo('/workspace/tests')"
      />
    </div>
  </div>

  <div v-else class="state-box">
    <ProgressSpinner v-if="pending" strokeWidth="4" />
    <template v-else-if="error">
      <i class="pi pi-exclamation-triangle" />
      <span>Не удалось загрузить вопрос. Попробуйте позже.</span>
    </template>
    <template v-else>
      <i class="pi pi-inbox" />
      <span>Вопрос не найден.</span>
      <Button
        label="Вернуться к списку"
        icon="pi pi-arrow-left"
        text
        @click="navigateTo('/workspace/questions')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Tag as UiTag } from "@shared/ui";
import type { WorkspaceQuestion } from "@entities/questions-card/model/types";

const props = defineProps<{
  questionId: number;
}>();

const bookmarks = useState<Set<number>>(
  "workspace-question-bookmarks",
  () => new Set()
);

const questionKey = computed(() => `workspace-question-${props.questionId}`);

const {
  data: question,
  pending,
  error,
} = await useAsyncData(
  questionKey,
  async () => {
    const { getQuestion } = useAsyncTestQuestion();
    const response = await getQuestion(props.questionId);
    return response.question;
  },
  {
    watch: [() => props.questionId],
  }
);

const bookmarked = computed(() => bookmarks.value.has(props.questionId));

const toggleBookmark = () => {
  const key = props.questionId;
  if (bookmarks.value.has(key)) {
    const next = new Set(bookmarks.value);
    next.delete(key);
    bookmarks.value = next;
  } else {
    bookmarks.value = new Set([...bookmarks.value, key]);
  }
};
</script>

<style scoped src="../style/workspace-question-detail.css"></style>

