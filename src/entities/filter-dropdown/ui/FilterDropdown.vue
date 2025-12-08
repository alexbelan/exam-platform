<template>
  <div class="filter-dropdown">
    <label v-if="label" class="filter-dropdown__label">{{ label }}</label>
    <Dropdown
      :model-value="modelValue"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :placeholder="placeholder"
      :loading="loading"
      class="filter-dropdown__select"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import type { FilterDropdownProps } from "../model/types";

defineProps<FilterDropdownProps>();
defineEmits<{
  (event: "update:modelValue", value: string | number | boolean | null): void;
}>();
</script>

<style scoped>
.filter-dropdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-dropdown__label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.filter-dropdown__select {
  width: 100%;
}
</style>
