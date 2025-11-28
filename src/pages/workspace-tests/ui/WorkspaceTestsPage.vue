<template>
  <div class="workspace-tests-page">
    <WorkspaceTestsCatalog @start-test="handleStartTest" />
  </div>
</template>

<script setup lang="ts">
import { WorkspaceTestsCatalog } from "@widgets/workspace-tests-catalog";

const handleStartTest = (id: number) => {
  navigateTo(`/workspace/tests/${id}`);
};
</script>

<style scoped>
.workspace-tests-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

