<template>
  <ProfilePage />
</template>

<script setup lang="ts">
import { ProfilePage } from "@pages/profile";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

// SEO Meta tags
useSeoMeta({
  title: "Профиль",
});
</script>
