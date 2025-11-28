<script setup lang="ts">
import { AdminTagCategoriesPage } from "@pages/admin/tag-categories";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminTagCategoriesPage />
</template>
