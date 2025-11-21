<template>
  <div class="form-section">
    <div class="checkbox-group">
      <Checkbox
        :modelValue="props.modelValue"
        @update:modelValue="updateValue"
        :binary="props.binary"
        :inputId="inputId"
        v-bind="checkboxAttrs"
      />
      <label v-if="props.label" :for="inputId" class="checkbox-label">
        {{ props.label }}
        <span v-if="props.required" class="required">*</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Checkbox from "primevue/checkbox";

interface Props {
  modelValue?: boolean;
  label?: string;
  required?: boolean;
  binary?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: "",
  required: false,
  binary: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const attrs = useAttrs();

const inputId = computed(() => {
  return (
    (attrs.inputId as string) ||
    `checkbox-${Math.random().toString(36).substr(2, 9)}`
  );
});

const checkboxAttrs = computed(() => {
  const { inputId: _, ...rest } = attrs;
  return rest;
});

const updateValue = (value: boolean) => {
  emit("update:modelValue", value);
};
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-label {
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
}
</style>
