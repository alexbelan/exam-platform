<template>
  <div class="form-section">
    <label v-if="props.label" class="form-label" :for="textInputId">
      {{ props.label }}
      <span v-if="props.required" class="required">*</span>
    </label>

    <InputNumber
      v-if="isNumberInput"
      :model-value="numberModelValue"
      v-bind="inputAttrs"
      class="form-input"
      @update:model-value="updateNumberValue"
    />
    <InputText
      v-else
      :id="textInputId"
      :model-value="textModelValue"
      :type="props.type"
      v-bind="inputAttrs"
      class="form-input"
      @update:model-value="updateTextValue"
    />

    <small v-if="props.error" class="p-error">{{ props.error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

type InputType = "text" | "number" | "email";

interface Props {
  modelValue?: string | number | null;
  label?: string;
  required?: boolean;
  type?: InputType;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "",
  required: false,
  type: "text" as InputType,
  error: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
}>();

const attrs = useAttrs();

const inputAttrs = computed(() => {
  const {
    type: _type,
    error: _error,
    id: _id,
    ...rest
  } = attrs as Record<string, unknown>;
  return { ...rest };
});

const isNumberInput = computed(() => props.type === "number");

const numberModelValue = computed(() => {
  if (typeof props.modelValue === "number") {
    return props.modelValue;
  }
  if (
    props.modelValue === null ||
    props.modelValue === undefined ||
    props.modelValue === ""
  ) {
    return null;
  }
  const parsed = Number(props.modelValue);
  return Number.isNaN(parsed) ? null : parsed;
});

const textModelValue = computed(() =>
  props.modelValue != null ? String(props.modelValue) : "",
);

const textInputId = computed(() => (attrs.id as string) || undefined);

const updateValue = (value: string | number | null) => {
  emit("update:modelValue", value);
};

const updateTextValue = (value?: string) => {
  updateValue(value ?? "");
};

const updateNumberValue = (value: number | null) => {
  updateValue(value);
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

.form-input {
  width: 100%;
}
</style>
