<template>
  <div class="workspace-profile-display">
    <!-- Loading state -->
    <div v-if="pending" class="workspace-profile-display__skeleton">
      <Skeleton
        v-for="i in 6"
        :key="i"
        width="100%"
        height="200px"
        class="workspace-profile-display__skeleton-item"
      />
    </div>

    <!-- Content -->
    <div v-else-if="!error">
      <!-- Empty state -->
      <div
        v-if="questions.length === 0 && tests.length === 0 && !pending"
        class="workspace-profile-display__empty"
      >
        <i class="pi pi-inbox" />
        <p>Здесь пока ничего нет</p>
      </div>

      <!-- Вопросы и тесты -->
      <div v-else class="workspace-profile-display__content">
        <QuestionCard
          v-for="question in questions"
          :key="question.id"
          :question="question"
          :bookmarks="bookmarks"
          @open="handleOpenQuestion"
          @toggle-bookmark="handleToggleBookmark"
        />

        <TestCard
          v-for="test in tests"
          :key="test.id"
          :test="test"
          @start-test="handleStartTest"
        />
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="workspace-profile-display__error">
      <i class="pi pi-exclamation-triangle" />
      <p>Ошибка при загрузке данных</p>
      <Button label="Попробовать снова" @click="refresh" />
    </div>

    <!-- Load more trigger -->
    <div
      v-if="hasMore && activeFilter === 'incorrect-answers'"
      ref="loadMoreTrigger"
      class="workspace-profile-display__load-more-trigger"
    />

    <!-- Loading more -->
    <div v-if="loadingMore" class="workspace-profile-display__loading-more">
      <ProgressSpinner />
      <span>Загрузка...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from "#app";
import { QuestionCard } from "@entities/questions-card";
import { TestCard } from "@entities/test-card";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { useWorkspaceProfileDisplay } from "../model/useWorkspaceProfileDisplay";

const {
  questions,
  tests,
  pending,
  loadingMore,
  error,
  hasMore,
  activeFilter,
  loadMore,
  refresh,
  loadMoreTrigger,
} = useWorkspaceProfileDisplay();

// Bookmarks для вопросов
const bookmarks = useState<Set<number>>(
  "workspace-question-bookmarks",
  () => new Set()
);

const handleOpenQuestion = (id: number) => {
  navigateTo(`/workspace/questions/${id}`);
};

const handleToggleBookmark = (id: number) => {
  const next = new Set(bookmarks.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  bookmarks.value = next;
  // TODO: Отправить запрос на сервер для сохранения
};

const handleStartTest = (id: number) => {
  navigateTo(`/workspace/tests/${id}`);
};
</script>

<style scoped src="../style/workspace-profile-display.css"></style>

