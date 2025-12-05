<template>
  <div class="workspace-questions-page">
    <WorkspaceQuestionsCatalog @open="handleOpen" />
  </div>
</template>

<script setup lang="ts">
import { WorkspaceQuestionsCatalog } from "@widgets/workspace-questions-catalog";

const handleOpen = (id: number) => {
  navigateTo(`/workspace/questions/${id}`);
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
