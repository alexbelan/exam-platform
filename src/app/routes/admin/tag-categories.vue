<script setup lang="ts">
import { AdminTagCategoriesPage } from "@pages/admin-categories";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminTagCategoriesPage />
</template>
