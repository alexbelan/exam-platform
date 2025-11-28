<script setup lang="ts">
import { WorkspaceDashboardPage } from "@pages/workspace/index";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceDashboardPage />
</template>
