<template>
  <div class="workspace-tests-catalog">
    <ActionsHeader
      title="Тесты и проверка знаний"
      description="Выбирайте тесты по интересующим темам и отслеживайте прогресс."
      search-placeholder="Поиск по названию теста"
      :search-value="search"
      :has-active-filters="hasActiveFilters"
      @search-update="(value) => (search = value)"
      @reset-filters="resetFilters"
    >
      <template #actions>
        <slot name="header-actions" />
      </template>
    </ActionsHeader>

    <div class="workspace-tests-catalog__content-grid">
      <WorkspaceTestDisplay
        :filters="() => filters"
        @start-test="handleStartTest"
      />
      <TagFilter v-model="selectedTags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WorkspaceTestDisplay } from "@features/workspace-test-display";
import { TagFilter } from "@features/tag-filter";
import { ActionsHeader } from "@entities/action-header";
import { useWorkspaceTestsCatalog } from "../model/useWorkspaceTestsCatalog";

const emit = defineEmits<{
  (event: "start-test", id: number): void;
}>();

const {
  search,
  selectedTags,
  filters,
  hasActiveFilters,
  resetFilters,
  handleStartTest,
} = useWorkspaceTestsCatalog(emit);
</script>

<style scoped src="../style/workspace-tests-catalog.css"></style>
