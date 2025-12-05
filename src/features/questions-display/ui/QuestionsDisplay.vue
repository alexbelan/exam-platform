<template>
  <section class="workspace-questions-display">
    <div
      v-if="error"
      class="workspace-questions-display__state workspace-questions-display__state--error"
    >
      <i class="pi pi-exclamation-triangle" />
      <p>Не удалось загрузить вопросы. Попробуйте обновить страницу.</p>
      <Button
        label="Повторить попытку"
        icon="pi pi-refresh"
        @click="handleRefresh"
      />
    </div>

    <div v-else-if="pending" class="workspace-questions-display__skeletons">
      <Skeleton
        v-for="index in 6"
        :key="index"
        height="200px"
        borderRadius="16px"
      />
    </div>

    <div v-else-if="showEmptyState" class="workspace-questions-display__state">
      <i class="pi pi-inbox" />
      <p>Пока нет вопросов, подходящих под фильтр.</p>
      <Button
        label="Обновить"
        icon="pi pi-refresh"
        text
        @click="handleRefresh"
      />
    </div>

    <div v-else class="workspace-questions-display__content">
      <div class="workspace-questions-display__grid">
        <QuestionCard
          v-for="question in questions"
          :key="question.id"
          :question="question"
          @open="handleOpen"
          @toggle-bookmark="handleToggleBookmark"
        />
      </div>

      <div
        v-if="questions.length > 0"
        ref="loadMoreTrigger"
        class="workspace-questions-display__load-more"
      >
        <div
          v-if="loadingMore"
          class="workspace-questions-display__loading-more"
        >
          <ProgressSpinner strokeWidth="4" />
          <span>Загружаем еще вопросы...</span>
        </div>
        <div
          v-else-if="hasMore"
          class="workspace-questions-display__load-more-hint"
        >
          <i class="pi pi-arrow-down" />
          <span>Прокрутите вниз для загрузки</span>
        </div>
        <div v-else class="workspace-questions-display__no-more">
          <i class="pi pi-check-circle" />
          <span>Все вопросы загружены</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import ProgressSpinner from "primevue/progressspinner";
import { QuestionCard } from "@entities/questions-card";
import { useQuestionsDisplay } from "../model/useQuestionsDisplay";

interface QuestionsDisplayProps {
  filters?:
    | {
        search?: string;
        level?: string;
        tags?: string[];
      }
    | (() => {
        search?: string;
        level?: string;
        tags?: string[];
      });
}

const props = defineProps<QuestionsDisplayProps>();

const emit = defineEmits<{
  (event: "open", id: number): void;
}>();

const {
  questions,
  pending,
  loadingMore,
  error,
  hasMore,
  loadMoreTrigger,
  refresh,
  handleToggleBookmark,
} = useQuestionsDisplay({
  filters: () => {
    if (typeof props.filters === "function") {
      return props.filters();
    }
    return props.filters ?? {};
  },
  immediate: true,
});

const showEmptyState = computed(
  () => !pending.value && !error.value && questions.value.length === 0
);

const handleRefresh = () => refresh();
const handleOpen = (id: number) => emit("open", id);
</script>

<style scoped src="../style/workspace-questions-display.css"></style>
