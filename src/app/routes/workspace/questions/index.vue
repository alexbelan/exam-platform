<script setup lang="ts">
import { WorkspaceQuestionsPage } from "@pages/workspace/questions/index";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceQuestionsPage />
</template>
