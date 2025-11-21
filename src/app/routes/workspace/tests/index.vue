<template>
  <div class="workspace-tests">
    <WorkspaceTestsCatalog @start-test="startTest" />
  </div>
</template>

<script setup lang="ts">
import { WorkspaceTestsCatalog } from "@widgets/workspace-tests-catalog";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

const startTest = (id: number) => {
  navigateTo(`/workspace/tests/${id}`);
};
</script>

<style scoped>
.workspace-tests {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>
