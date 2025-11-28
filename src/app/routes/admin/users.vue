<script setup lang="ts">
import { AdminUsersPage } from "@pages/admin-users";

definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});
</script>

<template>
  <AdminUsersPage />
</template>
