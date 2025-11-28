<script setup lang="ts">
import { WorkspaceTestsPage } from "@pages/workspace-tests";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceTestsPage />
</template>
