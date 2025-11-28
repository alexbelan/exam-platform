<template>
  <div class="admin-tests-filters">
    <div class="filter-group">
      <label>Поиск:</label>
      <InputText
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Поиск по названию..."
        class="search-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import { useTestsFilters } from "../model/useTestsFilters";
import type { TestsFiltersProps, TestsFiltersEmits } from "../model/types";

const props = defineProps<TestsFiltersProps>();
const emit = defineEmits<TestsFiltersEmits>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { search } = useTestsFilters(filters);
</script>

<style scoped src="../style/admin-tests-filters.css"></style>

