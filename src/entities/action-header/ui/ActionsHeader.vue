<template>
  <div class="action-header">
    <div class="action-header__info">
      <h2 class="action-header__title">{{ title }}</h2>
      <p v-if="description" class="action-header__description">
        {{ description }}
      </p>
    </div>
    <div class="action-header__actions">
      <InputText
        v-if="searchPlaceholder !== undefined"
        :model-value="searchValue"
        :placeholder="searchPlaceholder"
        class="action-header__search"
        @update:model-value="handleSearchUpdate"
      />
      <Button
        v-if="hasActiveFilters"
        label="Сбросить фильтры"
        icon="pi pi-filter-slash"
        severity="secondary"
        text
        @click="handleResetFilters"
      />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActionsHeaderProps } from "../model/types";

const props = withDefaults(defineProps<ActionsHeaderProps>(), {
  description: undefined,
  searchPlaceholder: undefined,
  searchValue: "",
  hasActiveFilters: false,
});

const emit = defineEmits<{
  (event: "search-update", value: string): void;
  (event: "reset-filters"): void;
}>();

const handleSearchUpdate = (value: string) => {
  emit("search-update", value);
  props.onSearchUpdate?.(value);
};

const handleResetFilters = () => {
  emit("reset-filters");
  props.onResetFilters?.();
};
</script>

<style scoped src="../style/action-header.css"></style>

