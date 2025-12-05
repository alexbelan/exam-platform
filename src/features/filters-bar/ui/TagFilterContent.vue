<template>
  <div class="filters-bar__tag-filter">
    <h3 class="filters-bar__tag-filter-title">Фильтр по тегам</h3>
    
    <TagFilterSkeleton v-if="pending" />
    <div v-else-if="error" class="filters-bar__tag-filter-state filters-bar__tag-filter-state--error">
      <i class="pi pi-exclamation-triangle" />
      <span>Не удалось загрузить теги</span>
    </div>
    <div v-else-if="isEmpty" class="filters-bar__tag-filter-state">
      <i class="pi pi-inbox" />
      <span>Теги ещё не добавлены</span>
    </div>
    <div v-else class="filters-bar__tag-filter-categories">
      <div
        v-for="group in groupedCategories"
        :key="group.key"
        class="filters-bar__tag-filter-category"
      >
        <button
          type="button"
          class="filters-bar__tag-filter-category-header"
          @click="toggleCategory(group.key)"
        >
          <span class="filters-bar__tag-filter-category-name">{{ group.name }}</span>
          <i
            class="pi pi-angle-right filters-bar__tag-filter-category-icon"
            :class="{
              'filters-bar__tag-filter-category-icon--expanded': isCategoryExpanded(
                group.key
              ),
            }"
          />
        </button>

        <transition name="filters-bar__tag-filter-collapse">
          <div
            v-show="isCategoryExpanded(group.key)"
            class="filters-bar__tag-filter-tags"
          >
            <UiTag
              v-for="tag in group.tags"
              :key="tag.id"
              :class="[
                'filters-bar__tag-filter-tag',
                { 'filters-bar__tag-filter-tag--selected': isSelected(tag.slug) },
              ]"
              :color="getTagColor(tag, isSelected(tag.slug))"
              :backgroundOpacity="0.16"
              role="button"
              tabindex="0"
              @click="toggleTag(tag.slug)"
              @keydown.enter.prevent="toggleTag(tag.slug)"
              @keydown.space.prevent="toggleTag(tag.slug)"
            >
              {{ tag.name }}
            </UiTag>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTagFilterContent } from "../model/useTagFilterContent";
import type { TagFilterEmits } from "@features/tag-filter/model/types";
import { Tag as UiTag } from "@shared/ui";
import TagFilterSkeleton from "@features/tag-filter/ui/TagFilterSkeleton.vue";

const modelValue = defineModel<string[]>({ default: () => [] });
const emit = defineEmits<TagFilterEmits>();

const {
  pending,
  error,
  isEmpty,
  groupedCategories,
  isCategoryExpanded,
  toggleCategory,
  isSelected,
  toggleTag,
  getTagColor,
} = useTagFilterContent(modelValue, emit);
</script>

<style scoped src="../style/tag-filter-content.css"></style>

