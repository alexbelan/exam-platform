<script setup lang="ts">
import { AdminSettingsPage } from "@pages/admin/settings";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminSettingsPage />
</template>
