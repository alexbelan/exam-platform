<template>
  <div class="action-header">
    <div class="action-header__info">
      <h2 class="action-header__title">{{ title }}</h2>
      <p v-if="description" class="action-header__description">
        {{ description }}
      </p>
    </div>
    <div class="action-header__actions">
      <Button
        icon="pi pi-filter"
        label="Фильтры"
        severity="secondary"
        outlined
        class="action-header__filters-button"
        @click="$emit('toggle-filters')"
      />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import type { ActionsHeaderProps } from "../model/types";

const props = withDefaults(defineProps<ActionsHeaderProps>(), {
  description: undefined,
  showFiltersButton: false,
});

const emit = defineEmits<{
  (event: "toggle-filters"): void;
}>();
</script>

<style scoped src="../style/action-header.css"></style>
