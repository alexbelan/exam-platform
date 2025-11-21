<template>
  <div class="workspace-questions-catalog">
    <ActionsHeader
      title="Вопросы для практики"
      description="Просматривайте, сохраняйте и тренируйтесь. Новые вопросы добавляются ежедневно."
      search-placeholder="Поиск по заголовку или тегам"
      :search-value="search"
      :has-active-filters="hasActiveFilters"
      @search-update="(value) => (search = value)"
      @reset-filters="resetFilters"
    >
      <template #actions>
        <slot name="header-actions" />
      </template>
    </ActionsHeader>

    <div class="workspace-questions-catalog__content-grid">
      <WorkspaceQuestionsDisplay
        :filters="() => filters"
        :bookmarks="bookmarks"
        @open="handleOpen"
        @toggle-bookmark="handleToggleBookmark"
      />
      <TagFilter v-model="selectedTags" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WorkspaceQuestionsDisplay } from "@features/workspace-questions-display";
import { TagFilter } from "@features/tag-filter";
import { ActionsHeader } from "@entities/action-header";
import { useWorkspaceQuestionsCatalog } from "../model/useWorkspaceQuestionsCatalog";

const emit = defineEmits<{
  (event: "open", id: number): void;
  (event: "toggle-bookmark", id: number): void;
}>();

const {
  search,
  selectedTags,
  filters,
  bookmarks,
  hasActiveFilters,
  resetFilters,
  handleOpen,
  handleToggleBookmark,
} = useWorkspaceQuestionsCatalog(
  (id) => emit("open", id),
  (id) => emit("toggle-bookmark", id)
);
</script>

<style scoped src="../style/workspace-questions-catalog.css"></style>
