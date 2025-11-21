<template>
  <div class="date-picker">
    <label v-if="label" class="date-picker__label">
      {{ label }}
      <span v-if="required" class="date-picker__required">*</span>
    </label>
    <Calendar
      :modelValue="modelValue"
      @update:modelValue="onUpdate"
      :selectionMode="selectionMode"
      :showIcon="showIcon"
      :placeholder="placeholder"
      :showTime="showTime"
      :hourFormat="hourFormat"
      :minDate="minDate"
      :maxDate="maxDate"
      v-bind="calendarAttrs"
      class="date-picker__input"
    />
  </div>
</template>

<script setup lang="ts">
import Calendar from "primevue/calendar";
import { computed, useAttrs } from "vue";

interface Props {
  modelValue?: Date | Date[] | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
  selectionMode?: "single" | "multiple" | "range";
  showIcon?: boolean;
  showTime?: boolean;
  hourFormat?: "12" | "24";
  minDate?: Date | null;
  maxDate?: Date | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: "",
  required: false,
  placeholder: "",
  selectionMode: "single",
  showIcon: false,
  showTime: false,
  hourFormat: "24",
  minDate: null,
  maxDate: null,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Date | Date[] | null): void;
  (e: "change", value: Date | Date[] | null): void;
}>();

const attrs = useAttrs();

const calendarAttrs = computed(() => {
  const {
    modelValue,
    label,
    required,
    placeholder,
    selectionMode,
    showIcon,
    showTime,
    hourFormat,
    minDate,
    maxDate,
    ...rest
  } = attrs;
  return rest;
});

const onUpdate = (value: Date | Date[] | null) => {
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-picker__label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.date-picker__required {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.date-picker__input {
  width: 100%;
}
</style>
