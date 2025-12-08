<template>
  <div v-if="question" class="question-details">
    <div class="question-header">
      <Button label="Назад" icon="pi pi-arrow-left" text @click="goBack" />
      <Button
        v-tooltip.top="
          question?.isFavorite ? 'Удалить из сохраненных' : 'Сохранить вопрос'
        "
        :icon="question?.isFavorite ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
        :severity="question?.isFavorite ? 'success' : 'secondary'"
        :loading="togglingFavorite"
        rounded
        text
        @click="handleToggleBookmark"
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
  </div>

  <div v-else class="state-box">
    <ProgressSpinner v-if="pending" stroke-width="4" />
    <template v-else-if="error">
      <i class="pi pi-exclamation-triangle" />
      <span>Не удалось загрузить вопрос. Попробуйте позже.</span>
    </template>
    <template v-else>
      <i class="pi pi-inbox" />
      <span>Вопрос не найден.</span>
      <Button label="Назад" icon="pi pi-arrow-left" text @click="goBack" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Tag as UiTag } from "@shared/ui";
import { useWorkspaceQuestionDetail } from "../model/useWorkspaceQuestionDetail";

const route = useRoute();
const questionId = computed(() => Number(route.params.id));

const {
  question,
  pending,
  error,
  togglingFavorite,
  handleToggleBookmark,
  goBack,
} = useWorkspaceQuestionDetail(() => questionId.value);
</script>

<style scoped src="../style/workspace-question-detail.css"></style>
