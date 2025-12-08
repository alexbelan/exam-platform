<template>
  <div class="workspace-questions-page">
    <div class="workspace-questions-catalog">
      <ActionsHeader
        title="Вопросы для практики"
        description="Просматривайте, сохраняйте и тренируйтесь."
        :show-filters-button="true"
        @toggle-filters="toggleFilters"
      >
        <template #actions>
          <slot name="header-actions" />
        </template>
      </ActionsHeader>

      <div class="workspace-questions-catalog__content-grid">
        <QuestionsDisplay :filters="filters" @open="handleOpen" />

        <!-- FiltersBar для ДЕСКТОПА - внутри grid -->
        <FiltersBar
          class="workspace-questions-catalog__filters-desktop"
          :model-value="{ search: filters.search, tags: filters.tags }"
          search-label="Поиск"
          search-placeholder="Поиск по заголовку или тегам"
          @update:model-value="handleFiltersUpdate"
          @reset="resetFilters"
        />
      </div>

      <!-- Overlay для закрытия при клике вне фильтров (только мобилка) -->
      <div
        v-if="isFiltersOpen"
        class="workspace-questions-catalog__overlay"
        @click="closeFilters"
      />

      <!-- FiltersBar для МОБИЛКИ - вне grid для правильного fixed позиционирования -->
      <FiltersBar
        class="workspace-questions-catalog__filters-mobile"
        :model-value="{ search: filters.search, tags: filters.tags }"
        search-label="Поиск"
        search-placeholder="Поиск по заголовку или тегам"
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
import { QuestionsDisplay } from "@features/questions-display";
import { FiltersBar } from "@features/filters-bar";
import { ActionsHeader } from "@entities/action-header";
import { useWorkspaceQuestionsCatalog } from "../model/useWorkspaceQuestionsCatalog";

const {
  filters,
  resetFilters,
  handleOpen: handleOpenCatalog,
  handleFiltersUpdate,
} = useWorkspaceQuestionsCatalog((id) =>
  navigateTo(`/workspace/questions/${id}`),
);

const handleOpen = (id: number) => {
  handleOpenCatalog(id);
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
.workspace-questions-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  height: 100%;
}
</style>

<style scoped src="../style/workspace-questions-catalog.css"></style>
