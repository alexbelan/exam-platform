<script setup lang="ts">
import { AdminSubmissionsPage } from "@pages/admin/submissions";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminSubmissionsPage />
</template>
