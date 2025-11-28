<script setup lang="ts">
import { WorkspaceDashboardPage } from "@pages/workspace-dashboard";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceDashboardPage />
</template>
