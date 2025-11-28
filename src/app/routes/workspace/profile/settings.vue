<script setup lang="ts">
import { WorkspaceProfileSettingsPage } from "@pages/workspace-profile-settings";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});
</script>

<template>
  <WorkspaceProfileSettingsPage />
</template>
