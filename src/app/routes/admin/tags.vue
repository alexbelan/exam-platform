<script setup lang="ts">
import { AdminTagsPage } from "@pages/admin/tags";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminTagsPage />
</template>
