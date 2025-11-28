<script setup lang="ts">
import { AdminQuestionPage } from "@pages/admin-question-detail";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminQuestionPage />
</template>
