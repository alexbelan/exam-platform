<template>
  <WorkspaceTestTaking :test-id="testId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WorkspaceTestTaking } from "@widgets/workspace-test-taking";

const route = useRoute();
const testId = computed(() => {
  const id = route.params.id;
  if (Array.isArray(id)) {
    return id[0] || "";
  }
  return id || "";
});
</script>

