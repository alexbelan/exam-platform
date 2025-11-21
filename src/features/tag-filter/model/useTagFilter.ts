import { computed, ref, watch, type Ref } from "vue";
import appTheme from "~/themes/theme";
import { normalizeHex, resolveThemeToken } from "@shared/utils";
import { useLocalStorage } from "@shared/hooks";
import type { TagFilterEmits, TagFilterTag } from "./types";

const UNCATEGORIZED_KEY = "__uncategorized";
const STORAGE_KEY = "tag-filter-expanded-categories";

type ThemePrimitivePalette = Record<string, Record<string, string>>;

const themePreset = appTheme?.preset as
  | { primitive?: ThemePrimitivePalette; semantic?: Record<string, any> }
  | undefined;
const themePrimitivePalette = (themePreset?.primitive ??
  {}) as ThemePrimitivePalette;

const DEFAULT_CATEGORY_COLOR =
  resolveThemeToken(
    themePreset?.semantic?.colorScheme?.light?.primary?.color ?? "{purple.600}",
    themePrimitivePalette
  ) ?? "#7c3aed";

const UNSELECTED_COLOR = "#1f2937";

export const useTagFilter = (
  modelValue: Ref<string[]>,
  emit: TagFilterEmits
) => {
  const {
    data: tagsData,
    pending,
    error,
    refresh,
  } = useAsyncData("tag-filter-tags", () =>
    $fetch<{ tags: TagFilterTag[] }>("/api/tags")
  );

  const tags = computed(() => tagsData.value?.tags ?? []);

  const selectedSet = computed(() => new Set(modelValue.value ?? []));

  const groupedCategories = computed(() => {
    const map = new Map<
      string,
      {
        key: string;
        name: string;
        color?: string | null;
        tags: TagFilterTag[];
      }
    >();

    tags.value.forEach((tag) => {
      const category = tag.category;
      const key = category?.id ?? UNCATEGORIZED_KEY;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: category?.name ?? "Без категории",
          color: category?.color ?? null,
          tags: [],
        });
      }
      map.get(key)!.tags.push(tag);
    });

    const groups = Array.from(map.values());

    groups.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    groups.forEach((group) =>
      group.tags.sort((a, b) => a.name.localeCompare(b.name, "ru"))
    );

    return groups;
  });

  const expandedCategoriesArray = useLocalStorage<string[]>(STORAGE_KEY, []);
  const expandedCategories = computed({
    get: () => new Set(expandedCategoriesArray.value),
    set: (value: Set<string>) => {
      expandedCategoriesArray.value = Array.from(value);
    },
  });

  const hasInitialized = ref(false);

  const ensureExpandedDefaults = () => {
    const hasGroups = groupedCategories.value.length > 0;

    if (!hasInitialized.value && hasGroups) {
      if (expandedCategories.value.size === 0) {
        const allKeys = groupedCategories.value.map((group) => group.key);
        expandedCategoriesArray.value = allKeys;
      }
      hasInitialized.value = true;
    }

    selectedSet.value.forEach((slug) => {
      const tag = tags.value.find((item) => item.slug === slug);
      if (tag) {
        const categoryKey = tag.category?.id ?? UNCATEGORIZED_KEY;
        if (!expandedCategories.value.has(categoryKey)) {
          const next = new Set(expandedCategories.value);
          next.add(categoryKey);
          expandedCategories.value = next;
        }
      }
    });
  };

  watch(
    groupedCategories,
    () => {
      const existingKeys = new Set(
        groupedCategories.value.map((group) => group.key)
      );
      const filtered = Array.from(expandedCategories.value).filter((key) =>
        existingKeys.has(key)
      );
      expandedCategoriesArray.value = filtered;
      ensureExpandedDefaults();
    },
    { immediate: true }
  );

  watch(
    modelValue,
    () => {
      ensureExpandedDefaults();
    },
    { immediate: true }
  );

  const toggleTag = (slug: string) => {
    const next = new Set(selectedSet.value);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    const updated = Array.from(next);
    modelValue.value = updated;
    emit("update:modelValue", updated);
  };

  const isSelected = (slug: string) => selectedSet.value.has(slug);

  const toggleCategory = (key: string) => {
    const next = new Set(expandedCategories.value);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    expandedCategories.value = next;
  };

  const isCategoryExpanded = (key: string) => expandedCategories.value.has(key);

  const getTagColor = (tag: TagFilterTag, selected: boolean) => {
    const categoryColor =
      normalizeHex(tag.category?.color) ?? DEFAULT_CATEGORY_COLOR;
    return selected ? categoryColor : UNSELECTED_COLOR;
  };

  const isEmpty = computed(
    () => !pending.value && !error.value && tags.value.length === 0
  );

  return {
    pending,
    error,
    refresh,
    isEmpty,
    groupedCategories,
    toggleTag,
    isSelected,
    toggleCategory,
    isCategoryExpanded,
    getTagColor,
  };
};
