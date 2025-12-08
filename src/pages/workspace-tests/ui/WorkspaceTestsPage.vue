<template>
  <div class="workspace-tests-page">
    <div class="workspace-tests-catalog">
      <ActionsHeader
        title="Тесты и проверка знаний"
        description="Выбирайте тесты по интересующим темам и отслеживайте прогресс."
        :show-filters-button="true"
        @toggle-filters="toggleFilters"
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </ActionsHeader>

      <div class="workspace-tests-catalog__content-grid">
        <TestsDisplay :filters="() => filters" @start-test="handleStartTest" />

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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TestsDisplay } from "@features/tests-display";
import { FiltersBar } from "@features/filters-bar";
import { ActionsHeader } from "@entities/action-header";
import { useWorkspaceTestsCatalog } from "../model/useWorkspaceTestsCatalog";

const {
  filters,
  resetFilters,
  handleStartTest: handleStartTestCatalog,
  handleFiltersUpdate,
} = useWorkspaceTestsCatalog((id) => navigateTo(`/workspace/tests/${id}`));

const handleStartTest = (id: number) => {
  handleStartTestCatalog(id);
};

const isFiltersOpen = ref(false);

const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

const closeFilters = () => {
  isFiltersOpen.value = false;
};
</script>

<style scoped>
.workspace-tests-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/workspace-tests-catalog.css"></style>
