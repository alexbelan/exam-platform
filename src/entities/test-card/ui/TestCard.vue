<template>
  <Card class="test-card">
    <template #content>
      <div class="test-card__content">
        <div class="test-card__header">
          <NuxtLink class="test-card__title" :to="testLink">
            {{ test.title }}
          </NuxtLink>
          <p v-if="test.description">{{ test.description }}</p>
        </div>

        <div class="test-card__tags" v-if="test.tags?.length">
          <UiTag
            v-for="tag in test.tags"
            :key="tag.id"
            :label="tag.name"
            :color="tag.category?.color ?? undefined"
          />
        </div>

        <p class="test-card__info-text">
          Количество вопросов: <strong>{{ test.questionsCount }}</strong>
        </p>

        <div class="test-card__actions">
          <Button label="Начать тест" icon="pi pi-play" @click="startTest" />
          <Button
            :label="isBookmarked ? 'Сохранено' : 'Сохранить'"
            :icon="isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
            :severity="isBookmarked ? 'success' : 'secondary'"
            outlined
            @click="toggleBookmark"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import { Tag as UiTag } from "@shared/ui";
import { useTestCard } from "../model/useTestCard";
import type { TestCardProps } from "../model/types";

const props = defineProps<TestCardProps>();

const emit = defineEmits<{
  (event: "start-test", id: number): void;
  (event: "toggle-bookmark", id: number): void;
}>();

const { startTest, isBookmarked, toggleBookmark } = useTestCard({
  test: props.test,
  onStartTest: (id: number) => emit("start-test", id),
  onToggleBookmark: (id: number) => emit("toggle-bookmark", id),
});

const testLink = computed(() => `/workspace/tests/${props.test.id}`);
</script>

<style scoped src="../style/test-card.css"></style>
