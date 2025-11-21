<template>
  <div class="workspace-questions">
    <WorkspaceQuestionsCatalog
      @open="openQuestion"
      @toggle-bookmark="toggleBookmark"
    />
  </div>
</template>

<script setup lang="ts">
import { WorkspaceQuestionsCatalog } from "@widgets/workspace-questions-catalog";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

const openQuestion = (id: number) => {
  navigateTo(`/workspace/questions/${id}`);
};

const toggleBookmark = (id: number) => {
  // Логика уже обрабатывается в виджете через useState
  // Этот обработчик нужен только для совместимости с emit
};
</script>

<style scoped>
.workspace-questions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>
