<template>
  <div class="workspace-questions-page">
    <WorkspaceQuestionsCatalog
      @open="handleOpen"
      @toggle-bookmark="handleToggleBookmark"
    />
  </div>
</template>

<script setup lang="ts">
import { WorkspaceQuestionsCatalog } from "@widgets/workspace-questions-catalog";

const handleOpen = (id: number) => {
  navigateTo(`/workspace/questions/${id}`);
};

const handleToggleBookmark = (id: number) => {
  // Логика уже обрабатывается в виджете через useState
  // Этот обработчик нужен только для совместимости с emit
};
</script>

<style scoped>
.workspace-questions-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

