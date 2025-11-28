<script setup lang="ts">
import { WorkspaceTestPage } from "@pages/workspace/tests/[id]";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceTestPage />
</template>
