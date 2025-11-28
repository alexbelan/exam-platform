<template>
  <div class="admin-submissions-filters">
    <div class="filter-group">
      <label>Поиск:</label>
      <InputText
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Поиск по заголовку или содержанию..."
        class="search-input"
      />
    </div>
    <div class="filter-group">
      <label>Статус:</label>
      <Dropdown
        :model-value="status"
        @update:model-value="status = $event"
        :options="statusOptions"
        placeholder="Все статусы"
        class="status-dropdown"
      />
    </div>
    <div class="filter-group">
      <label>Дата:</label>
      <Calendar
        :model-value="date"
        @update:model-value="date = $event"
        placeholder="Выберите дату"
        class="date-picker"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import { useSubmissionsFilters } from "../model/useSubmissionsFilters";
import type { SubmissionsFiltersProps, SubmissionsFiltersEmits } from "../model/types";

const props = defineProps<SubmissionsFiltersProps>();
const emit = defineEmits<SubmissionsFiltersEmits>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const {
  search,
  status,
  date,
  statusOptions,
} = useSubmissionsFilters(filters);
</script>

<style scoped src="../style/admin-submissions-filters.css"></style>

