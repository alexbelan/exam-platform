<script setup lang="ts">
import { WorkspaceQuestionsPage } from "@pages/workspace-questions";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceQuestionsPage />
</template>
