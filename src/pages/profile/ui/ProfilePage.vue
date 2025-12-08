<template>
  <div class="profile-page">
    <!-- Хедер профиля -->
    <ProfileHeader
      :user="userData"
      :statistics="statisticsValue"
      :loading="statisticsPendingValue"
    />

    <div class="profile-page__content">
      <div class="workspace-profile-display profile-page__content-area">
        <div v-if="pending" class="workspace-profile-display__skeleton">
          <Skeleton
            v-for="i in 6"
            :key="i"
            width="100%"
            height="200px"
            class="workspace-profile-display__skeleton-item"
          />
        </div>

        <div v-else-if="!error">
          <div
            v-if="questions.length === 0 && tests.length === 0 && !pending"
            class="workspace-profile-display__empty"
          >
            <i class="pi pi-inbox" />
            <p>Здесь пока ничего нет</p>
          </div>

          <div v-else class="workspace-profile-display__content">
            <QuestionCard
              v-for="question in questions"
              :key="question.id"
              :question="question"
              @open="handleOpenQuestion"
              @toggle-bookmark="handleToggleQuestionBookmark"
            />

            <TestCard
              v-for="test in tests"
              :key="test.id"
              :test="test"
              @start-test="handleStartTest"
              @toggle-bookmark="handleToggleTestBookmark"
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

      <!-- Боковой фильтр -->
      <ProfileFilter v-model="activeFilter" class="profile-page__filter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ProfileHeader } from "@entities/profile-header";
import { ProfileFilter } from "@entities/profile-filter";
import { QuestionCard } from "@entities/questions-card";
import { TestCard } from "@entities/test-card";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import { useProfilePage } from "../model/useProfilePage";
import { useWorkspaceProfileDisplay } from "../model/useWorkspaceProfileDisplay";

const { userData, activeFilter, statisticsValue, statisticsPendingValue } =
  useProfilePage();

const {
  questions,
  tests,
  pending,
  loadingMore,
  error,
  hasMore,
  refresh,
  handleToggleQuestionBookmark,
  handleToggleTestBookmark,
  setupInfiniteScroll,
} = useWorkspaceProfileDisplay();

const loadMoreTrigger = ref<HTMLElement | null>(null);

onMounted(() => {
  setupInfiniteScroll(loadMoreTrigger);
});

const handleOpenQuestion = (id: number) => {
  navigateTo(`/workspace/questions/${id}`);
};

const handleStartTest = (id: number) => {
  navigateTo(`/workspace/tests/${id}`);
};
</script>

<style scoped src="../style/profile-page.css"></style>
<style scoped src="../style/workspace-profile-display.css"></style>
