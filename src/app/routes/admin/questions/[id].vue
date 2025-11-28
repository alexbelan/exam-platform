<script setup lang="ts">
import { AdminQuestionPage } from "@pages/admin/questions/[id]";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminQuestionPage />
</template>
