<script setup lang="ts">
import { WorkspaceQuestionPage } from "@pages/workspace-question-detail";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceQuestionPage />
</template>
