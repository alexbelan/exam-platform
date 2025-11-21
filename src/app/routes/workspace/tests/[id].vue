<template>
  <TestTaking :test-id="testId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TestTaking } from "@widgets/test-taking";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

const route = useRoute();
const testId = computed(() => {
  const id = route.params.id;
  if (Array.isArray(id)) {
    return id[0] || "";
  }
  return id || "";
});
</script>
