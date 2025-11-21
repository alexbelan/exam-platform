<template>
  <div class="test-preview">
    <div class="test-preview__header">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          @click="goBack"
        />
        <p class="test-preview__eyebrow">Тест #{{ testId }}</p>
        <h1 class="test-preview__title">{{ test.name }}</h1>
        <p v-if="test.description" class="test-preview__description">
          {{ test.description }}
        </p>
      </div>

      <div class="test-preview__tags" v-if="tags.length > 0">
        <UiTag
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          :color="tag.category?.color ?? undefined"
          size="sm"
        />
      </div>

      <div class="test-preview__info">
        <div class="test-preview__info-item">
          <i class="pi pi-list-check"></i>
          <span
            >Количество вопросов:
            <strong>{{ test.questionsCount }}</strong></span
          >
        </div>
      </div>

      <div class="test-preview__actions">
        <Button
          label="Начать тест"
          icon="pi pi-play"
          @click="$emit('start')"
          class="test-preview__start-button"
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
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { Tag as UiTag } from "@shared/ui";
import { useTestPreview } from "../model/useTestPreview";
import type { TestPreviewProps } from "../model/types";

const props = defineProps<TestPreviewProps>();

defineEmits<{
  (e: "start"): void;
}>();

const { goBack } = useTestPreview(props);
</script>

<style scoped src="../style/test-preview.css"></style>

