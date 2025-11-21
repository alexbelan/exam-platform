<template>
  <Card class="tag-filter">
    <template #title>
      <h3 class="tag-filter__title">Фильтр по тегам</h3>
    </template>

    <template #content>
      <TagFilterSkeleton v-if="pending" />
      <div v-else-if="error" class="tag-filter__state tag-filter__state--error">
        <i class="pi pi-exclamation-triangle" />
        <span>Не удалось загрузить теги</span>
      </div>
      <div v-else-if="isEmpty" class="tag-filter__state">
        <i class="pi pi-inbox" />
        <span>Теги ещё не добавлены</span>
      </div>
      <div v-else class="tag-filter__categories">
        <div
          v-for="group in groupedCategories"
          :key="group.key"
          class="tag-filter__category"
        >
          <button
            type="button"
            class="tag-filter__category-header"
            @click="toggleCategory(group.key)"
          >
            <span class="tag-filter__category-name">{{ group.name }}</span>
            <i
              class="pi pi-angle-right tag-filter__category-icon"
              :class="{
                'tag-filter__category-icon--expanded': isCategoryExpanded(
                  group.key
                ),
              }"
            />
          </button>

          <transition name="tag-filter__collapse">
            <div
              v-show="isCategoryExpanded(group.key)"
              class="tag-filter__tags"
            >
              <UiTag
                v-for="tag in group.tags"
                :key="tag.id"
                :class="[
                  'tag-filter__tag',
                  { 'tag-filter__tag--selected': isSelected(tag.slug) },
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
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import { useTagFilter } from "../model/useTagFilter";
import type { TagFilterEmits } from "../model/types";
import { Tag as UiTag } from "@shared/ui";
import TagFilterSkeleton from "./TagFilterSkeleton.vue";

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
} = useTagFilter(modelValue, emit);
</script>

<style scoped src="../style/tag-filter.css"></style>
