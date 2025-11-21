<template>
  <span
    class="tag"
    :class="[
      `tag--${size}`,
      { 'tag--pill': pill, 'tag--uppercase': uppercase },
    ]"
    :style="tagStyle"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import appTheme from "~/themes/theme";
import { normalizeHex, resolveThemeToken } from "@shared/utils";

type Size = "sm" | "md" | "lg";

type ThemePrimitivePalette = Record<string, Record<string, string>>;

const themePreset = appTheme?.preset as
  | { primitive?: ThemePrimitivePalette }
  | undefined;
const themePrimitivePalette = (themePreset?.primitive ??
  {}) as ThemePrimitivePalette;

const FALLBACK_COLOR = "#9333ea";

const clampAlpha = (alpha: number) => Math.min(Math.max(alpha, 0), 1);

const DEFAULT_COLOR =
  resolveThemeToken("{purple.600}", themePrimitivePalette) ?? FALLBACK_COLOR;

interface Props {
  label?: string;
  color?: string | null;
  size?: Size;
  pill?: boolean;
  uppercase?: boolean;
  backgroundOpacity?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  size: "md",
  pill: false,
  uppercase: false,
  backgroundOpacity: 0.16,
});

const hexToRgba = (hex: string, alpha: number) => {
  const safeAlpha = clampAlpha(alpha);
  const normalized = normalizeHex(hex);
  if (!normalized) return hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

const resolvedHex = computed(() => {
  const candidate = resolveThemeToken(props.color, themePrimitivePalette);
  return candidate ?? DEFAULT_COLOR;
});

const backgroundColor = computed(() =>
  hexToRgba(resolvedHex.value, props.backgroundOpacity)
);

const tagStyle = computed(() => ({
  color: resolvedHex.value,
  backgroundColor: backgroundColor.value,
  borderColor: backgroundColor.value,
}));
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-weight: 600;
  line-height: 1.2;
  border-radius: 0.375rem;
  border: none;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease, transform 0.2s ease;
  user-select: none;
}

.tag--pill {
  border-radius: 9999px;
}

.tag--uppercase {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tag--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  gap: 0.25rem;
}

.tag--md {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.tag--lg {
  padding: 0.375rem 0.9rem;
  font-size: 0.95rem;
}

.tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.25);
}
</style>
