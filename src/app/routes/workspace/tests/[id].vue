<script setup lang="ts">
import { WorkspaceTestPage } from "@pages/workspace-test-detail";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceTestPage />
</template>
