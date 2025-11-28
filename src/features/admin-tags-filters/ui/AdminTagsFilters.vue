<template>
  <div class="admin-tags-filters">
    <div class="filter-group">
      <label>Поиск</label>
      <InputText
        :model-value="search"
        @update:model-value="search = $event"
        placeholder="Поиск по названию тега..."
        class="search-input"
      />
    </div>
    <div class="filter-group">
      <label>Категория</label>
      <Dropdown
        :model-value="categoryId"
        @update:model-value="categoryId = $event"
        :options="categoryFilterOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Все категории"
        class="category-filter"
        :loading="categoriesLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import { computed } from "vue";
import { useAdminTagsFilters } from "../model/useAdminTagsFilters";
import type { AdminTagsFiltersProps, AdminTagsFiltersEmits } from "../model/types";

const props = defineProps<AdminTagsFiltersProps>();
const emit = defineEmits<AdminTagsFiltersEmits>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { search, categoryId } = useAdminTagsFilters(filters);

const categoryFilterOptions = computed(() => [
  { label: "Все категории", value: null },
  ...props.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);
</script>

<style scoped src="../style/admin-tags-filters.css"></style>

