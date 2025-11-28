<script setup lang="ts">
import { AdminDashboardPage } from "@pages/admin/index";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminDashboardPage />
</template>
