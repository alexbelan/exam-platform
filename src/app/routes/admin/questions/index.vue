<script setup lang="ts">
import { AdminQuestionsPage } from "@pages/admin/questions";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminQuestionsPage />
</template>
