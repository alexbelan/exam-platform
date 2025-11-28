<script setup lang="ts">
import { WorkspaceQuestionPage } from "@pages/workspace/questions/[id]";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceQuestionPage />
</template>
