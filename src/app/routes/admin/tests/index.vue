<script setup lang="ts">
import { AdminTestsPage } from "@pages/admin-tests";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminTestsPage />
</template>
