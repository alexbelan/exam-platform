<template>
  <div class="workspace-tests-catalog">
    <ActionsHeader
      title="Тесты и проверка знаний"
      description="Выбирайте тесты по интересующим темам и отслеживайте прогресс."
      :showFiltersButton="true"
      @toggle-filters="toggleFilters"
    >
      <template #actions>
        <slot name="header-actions" />
      </template>
    </ActionsHeader>

    <div class="workspace-tests-catalog__content-grid">
      <TestsDisplay
        :filters="() => filters"
        @start-test="handleStartTest"
      />

      <!-- FiltersBar для ДЕСКТОПА - внутри grid -->
      <FiltersBar
        class="workspace-tests-catalog__filters-desktop"
        :model-value="{ search: filters.search, tags: filters.tags }"
        search-label="Поиск"
        search-placeholder="Поиск по названию теста"
        @update:model-value="handleFiltersUpdate"
        @reset="resetFilters"
      />
    </div>

    <!-- Overlay для закрытия при клике вне фильтров (только мобилка) -->
    <div
      v-if="isFiltersOpen"
      class="workspace-tests-catalog__overlay"
      @click="closeFilters"
    />

    <!-- FiltersBar для МОБИЛКИ - вне grid для правильного fixed позиционирования -->
    <FiltersBar
      class="workspace-tests-catalog__filters-mobile"
      :model-value="{ search: filters.search, tags: filters.tags }"
      search-label="Поиск"
      search-placeholder="Поиск по названию теста"
      :is-mobile-open="isFiltersOpen"
      @update:model-value="handleFiltersUpdate"
      @reset="resetFilters"
      @close="closeFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TestsDisplay } from "@features/tests-display";
import { FiltersBar } from "@features/filters-bar";
import { ActionsHeader } from "@entities/action-header";
import { useWorkspaceTestsCatalog } from "../model/useWorkspaceTestsCatalog";

const emit = defineEmits<{
  (event: "start-test", id: number): void;
}>();

const { filters, resetFilters, handleStartTest, handleFiltersUpdate } =
  useWorkspaceTestsCatalog((id) => emit("start-test", id));

const isFiltersOpen = ref(false);

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

const closeFilters = () => {
  isFiltersOpen.value = false;
};
</script>

<style scoped src="../style/workspace-tests-catalog.css"></style>
