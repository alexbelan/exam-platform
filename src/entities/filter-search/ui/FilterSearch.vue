<template>
  <div class="filter-search">
    <label v-if="label" class="filter-search__label">{{ label }}</label>
    <InputText
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      class="filter-search__input"
    />
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import type { FilterSearchProps } from "../model/types";

defineProps<FilterSearchProps>();
defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<style scoped>
.filter-search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-search__label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.filter-search__input {
  width: 100%;
}
</style>

