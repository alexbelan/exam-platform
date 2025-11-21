<template>
  <div class="form-section">
    <label v-if="props.label" class="form-label" :for="textareaId">
      {{ props.label }}
      <span v-if="props.required" class="required">*</span>
    </label>
    <Textarea
      :id="textareaId"
      :modelValue="textModelValue"
      @update:modelValue="updateValue"
      v-bind="textareaAttrs"
      class="form-textarea"
    />
    <small v-if="props.error" class="p-error">{{ props.error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Textarea from "primevue/textarea";

interface Props {
  modelValue?: string;
  label?: string;
  required?: boolean;
  rows?: number;
  autoResize?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "",
  required: false,
  rows: 3,
  autoResize: true,
  error: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const attrs = useAttrs();

const textareaAttrs = computed(() => {
  const {
    label: _label,
    required: _required,
    error: _error,
    ...rest
  } = attrs as Record<string, unknown>;
  return {
    rows: props.rows,
    autoResize: props.autoResize,
    ...rest,
  };
});

const textModelValue = computed(() =>
  props.modelValue != null ? String(props.modelValue) : ""
);

const textareaId = computed(() => (attrs.id as string) || undefined);

const updateValue = (value: string) => {
  emit("update:modelValue", value);
};
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
}

.form-textarea {
  width: 100%;
}
</style>
