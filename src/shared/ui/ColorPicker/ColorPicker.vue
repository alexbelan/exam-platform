<template>
  <div class="color-picker">
    <label v-if="label" class="color-picker__label">
      {{ label }}
      <span v-if="required" class="color-picker__required">*</span>
    </label>

    <color-picker
      v-model="internalValue"
      :withHexInput="withHexInput"
      :withColorsHistory="withColorsHistory"
      :withEyeDropper="withEyeDropper"
      :storageKey="storageKey"
      :withAlpha="withAlpha"
      :withInitialColor="withInitialColor"
      :withRgbInput="withRgbInput"
      :immediateEmit="immediateEmit"
      v-slot="{ color, show }"
      @change="onChange"
    >
      <button type="button" class="color-picker__trigger" @click="show($event)">
        <span
          class="color-picker__preview"
          :style="{ backgroundColor: color || defaultColor }"
        />
        <span class="color-picker__value">
          {{ displayColor }}
        </span>
      </button>
    </color-picker>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const DEFAULT_COLOR = "#3b82f6";

interface Props {
  modelValue?: string | null;
  label?: string;
  required?: boolean;
  storageKey?: string;
  withAlpha?: boolean;
  withInitialColor?: boolean;
  withEyeDropper?: boolean;
  withHexInput?: boolean;
  withRgbInput?: boolean;
  withColorsHistory?: boolean | number;
  immediateEmit?: boolean;
  defaultColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: DEFAULT_COLOR,
  label: "",
  required: false,
  storageKey: "color_history",
  withAlpha: false,
  withInitialColor: false,
  withEyeDropper: false,
  withHexInput: true,
  withRgbInput: false,
  withColorsHistory: 6,
  immediateEmit: false,
  defaultColor: DEFAULT_COLOR,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const normalizeHex = (value: string | null | undefined): string => {
  if (!value) return props.defaultColor || DEFAULT_COLOR;
  const hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    const expanded = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }
  if (hex.length === 6) {
    return `#${hex.toLowerCase()}`;
  }
  return props.defaultColor || DEFAULT_COLOR;
};

const internalValue = ref<string>(normalizeHex(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    internalValue.value = normalizeHex(value);
  }
);

watch(
  () => internalValue.value,
  (value) => {
    const normalized = normalizeHex(value);
    emit("update:modelValue", normalized);
  }
);

const onChange = (value: string) => {
  emit("change", normalizeHex(value));
};

const displayColor = computed(() =>
  normalizeHex(internalValue.value).toUpperCase()
);

const defaultColor = computed(() => normalizeHex(props.defaultColor));
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-picker__label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.color-picker__required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.color-picker__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.color-picker__trigger:hover {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
}

.color-picker__preview {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  flex-shrink: 0;
}

.color-picker__value {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.95rem;
  color: #1f2937;
}
</style>
