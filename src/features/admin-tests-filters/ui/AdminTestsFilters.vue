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
import { useAdminTestsFilters } from "../model/useAdminTestsFilters";
import type { AdminTestsFiltersProps, AdminTestsFiltersEmits } from "../model/types";

const props = defineProps<AdminTestsFiltersProps>();
const emit = defineEmits<AdminTestsFiltersEmits>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { search } = useAdminTestsFilters(filters);
</script>

<style scoped src="../style/admin-tests-filters.css"></style>

