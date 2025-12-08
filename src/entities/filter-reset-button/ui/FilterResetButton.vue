<template>
  <Button
    v-if="hasActiveFilters"
    v-tooltip.top="tooltip || 'Сбросить все фильтры'"
    icon="pi pi-filter-slash"
    severity="secondary"
    text
    rounded
    class="filter-reset-button"
    @click="$emit('reset')"
  />
</template>

<script setup lang="ts">
import Button from "primevue/button";
import type { FilterResetButtonProps } from "../model/types";

defineProps<FilterResetButtonProps>();
defineEmits<{
  (event: "reset"): void;
}>();
</script>

<style scoped>
.filter-reset-button {
  flex-shrink: 0;
}
</style>
