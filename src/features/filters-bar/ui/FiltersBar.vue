<template>
  <div
    class="filters-bar"
    :class="{ 'filters-bar--mobile-open': isMobileOpen }"
  >
    <div class="filters-bar__content">
      <div class="filters-bar__top-row">
        <FilterSearch
          :model-value="search"
          @update:model-value="search = $event"
          :label="searchLabel"
          :placeholder="searchPlaceholder"
        />
        <FilterResetButton
          :has-active-filters="hasActiveFilters"
          @reset="handleReset"
        />
      </div>

      <TagFilterContent v-model="selectedTags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FilterSearch } from "@entities/filter-search";
import { FilterResetButton } from "@entities/filter-reset-button";
import TagFilterContent from "./TagFilterContent.vue";
import { useFiltersBar } from "../model/useFiltersBar";
import type { FiltersBarProps, FiltersBarEmits } from "../model/types";

const props = withDefaults(
  defineProps<FiltersBarProps & { isMobileOpen?: boolean }>(),
  {
    isMobileOpen: false,
  }
);

const emit = defineEmits<FiltersBarEmits & { (event: "close"): void }>();

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const { search, selectedTags, hasActiveFilters, reset } =
  useFiltersBar(filters);

const handleReset = () => {
  reset();
  emit("reset");
};
</script>

<style scoped src="../style/filters-bar.css"></style>
