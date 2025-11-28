<template>
  <div class="admin-questions-filters">
    <div class="filter-group">
      <label>Поиск:</label>
      <InputText
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Поиск по заголовку..."
        class="search-input"
      />
    </div>
    <div class="filter-group">
      <label>Статус:</label>
      <Dropdown
        :model-value="status"
        @update:model-value="status = $event"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Все статусы"
        class="status-dropdown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import { useQuestionsFilters } from "../model/useQuestionsFilters";
import type { QuestionsFilters } from "../model/types";

const props = defineProps<{
  modelValue: QuestionsFilters;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: QuestionsFilters): void;
  (event: "reset"): void;
}>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { search, status, statusOptions } = useQuestionsFilters(filters);
</script>

<style scoped src="../style/admin-questions-filters.css"></style>

