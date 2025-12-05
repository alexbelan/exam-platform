<template>
  <article class="question-card">
    <NuxtLink
      :to="`/workspace/questions/${question.id}`"
      class="question-card__header"
    >
      <h3 class="question-card__title">{{ question.title }}</h3>
    </NuxtLink>

    <div class="question-card__tags" v-if="question.tags?.length">
      <UiTag
        v-for="tag in question.tags"
        :key="tag.id"
        :label="tag.name"
        :color="tag.category?.color ?? undefined"
      />
    </div>

    <div class="question-card__footer">
      <Button label="Открыть" icon="pi pi-eye" text @click="open" />
      <Button
        :label="isBookmarked ? 'Сохранено' : 'Сохранить'"
        :icon="isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
        :severity="isBookmarked ? 'success' : 'secondary'"
        outlined
        @click="toggleBookmark"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { Tag as UiTag } from "@shared/ui";
import { useQuestionCard } from "../model/useQuestionCard";
import type { QuestionCardProps } from "../model/types";

const props = defineProps<QuestionCardProps>();

const emit = defineEmits<{
  (event: "open", id: number): void;
  (event: "toggle-bookmark", id: number): void;
}>();

const { isBookmarked, open, toggleBookmark } = useQuestionCard({
  question: props.question,
  onToggleBookmark: (id: number) => emit("toggle-bookmark", id),
  onOpen: (id: number) => emit("open", id),
});
</script>

<style scoped src="../style/question-card.css"></style>
