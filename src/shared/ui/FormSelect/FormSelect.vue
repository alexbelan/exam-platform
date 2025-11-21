<template>
  <div class="form-section">
    <label v-if="props.label" class="form-label" :for="selectId">
      {{ props.label }}
      <span v-if="props.required" class="required">*</span>
    </label>

    <MultiSelect
      v-if="props.multiple"
      :id="selectId"
      :modelValue="multiModelValue"
      @update:modelValue="updateMultiValue"
      v-bind="selectAttrs"
      class="form-select"
    />
    <Select
      v-else
      :id="selectId"
      :modelValue="singleModelValue"
      @update:modelValue="updateSingleValue"
      v-bind="selectAttrs"
      class="form-select"
    />

    <small v-if="props.error" class="p-error">{{ props.error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";

interface Props {
  modelValue?: unknown;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: "",
  required: false,
  multiple: false,
  error: "",
});

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: string | number | Record<string, unknown> | Array<any> | null
  ): void;
}>();

const attrs = useAttrs();

const selectAttrs = computed(() => {
  const {
    label: _label,
    required: _required,
    error: _error,
    ...rest
  } = attrs as Record<string, unknown>;
  return { ...rest };
});

const selectId = computed(() => (attrs.id as string) || undefined);

const multiModelValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue;
  }
  if (props.modelValue == null) {
    return [];
  }
  return [props.modelValue];
});

const singleModelValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : null
);

const updateMultiValue = (value: any[] | null | undefined) => {
  emit("update:modelValue", value ?? []);
};

const updateSingleValue = (value: any | null | undefined) => {
  emit("update:modelValue", value ?? null);
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

.form-select {
  width: 100%;
}
</style>
