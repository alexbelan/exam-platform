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

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

const route = useRoute();
const id = computed(() => Number(route.params.id));

const bookmarks = useState<Set<number>>(
  "workspace-question-bookmarks",
  () => new Set()
);

const questionKey = computed(() => `workspace-question-${id.value}`);

const {
  data: question,
  pending,
  error,
} = await useAsyncData(
  questionKey,
  async () => {
    const { getQuestion } = useAsyncTestQuestion();
    const response = await getQuestion(Number(id.value));
    return response.question;
  },
  {
    watch: [id],
  }
);

const bookmarked = computed(() => bookmarks.value.has(id.value));

const toggleBookmark = () => {
  const key = id.value;
  if (bookmarks.value.has(key)) {
    const next = new Set(bookmarks.value);
    next.delete(key);
    bookmarks.value = next;
  } else {
    bookmarks.value = new Set([...bookmarks.value, key]);
  }
};
</script>

<style scoped>
.question-details {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
}

.question-tag {
  cursor: pointer;
}

.question-meta {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.question-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #1f2937;
  line-height: 1.7;
}

.question-content :deep(pre) {
  background: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  overflow-x: auto;
}

.question-content :deep(code) {
  font-family: "JetBrains Mono", monospace;
}

.question-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08);
}
</style>
