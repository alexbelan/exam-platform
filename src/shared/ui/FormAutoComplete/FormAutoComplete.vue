<template>
  <div class="form-section">
    <label v-if="props.label" class="form-label">
      {{ props.label }}
      <span v-if="props.required" class="required">*</span>
    </label>
    <AutoComplete
      :modelValue="props.modelValue"
      @update:modelValue="handleUpdate"
      :suggestions="filteredSuggestions"
      @complete="onComplete"
      @select="handleItemSelect"
      :multiple="props.multiple"
      :optionLabel="props.optionLabel"
      :forceSelection="false"
      :placeholder="props.placeholder"
      class="form-autocomplete"
      v-bind="autocompleteAttrs"
    >
      <template #option="slotProps">
        <div v-if="slotProps.option._isCreateOption" class="create-option">
          <i class="pi pi-plus" style="margin-right: 0.5rem"></i>
          {{ slotProps.option.label }}
        </div>
        <div v-else>{{ getOptionLabel(slotProps.option) }}</div>
      </template>
    </AutoComplete>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from "vue";
// import AutoComplete from "@primevue/autocomplete";

interface Props {
  modelValue?: any;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  optionLabel?: string;
  preventDuplicates?: boolean;
  placeholder?: string;
  completeMethod?: (query: string) => Promise<any[]>;
  suggestions?: any[];
  allowCreate?: boolean;
  createMethod?: (query: string) => Promise<any>;
  createLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  label: "",
  required: false,
  multiple: false,
  optionLabel: "name",
  preventDuplicates: true,
  placeholder: "",
  completeMethod: undefined,
  suggestions: undefined,
  allowCreate: false,
  createMethod: undefined,
  createLabel: "Создать",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const attrs = useAttrs();
const filteredSuggestions = ref<any[]>([]);
const loading = ref(false);
const currentQuery = ref<string>("");

const autocompleteAttrs = computed(() => {
  const {
    modelValue,
    label,
    required,
    multiple,
    optionLabel,
    preventDuplicates,
    placeholder,
    completeMethod,
    suggestions,
    ...rest
  } = attrs;
  return rest;
});

const isDuplicate = (value: any, currentValue: any): boolean => {
  if (props.multiple && Array.isArray(currentValue)) {
    if (typeof value === "string") {
      return currentValue.some(
        (item) =>
          (typeof item === "string" && item === value) ||
          (typeof item === "object" && item[props.optionLabel] === value)
      );
    }
    if (typeof value === "object" && value !== null) {
      const valueKey = value.id || value[props.optionLabel] || value.name;
      return currentValue.some((item) => {
        if (typeof item === "string") return false;
        if (typeof item === "object" && item !== null) {
          const itemKey = item.id || item[props.optionLabel] || item.name;
          return itemKey === valueKey;
        }
        return false;
      });
    }
  }
  return false;
};

const getOptionLabel = (option: any): string => {
  if (typeof option === "string") {
    return option;
  }
  if (option && typeof option === "object") {
    if (option._isCreateOption) {
      return option.label;
    }
    return option[props.optionLabel] || option.name || String(option);
  }
  return String(option);
};

const onComplete = async (event: { query: string }) => {
  const query = event.query;
  currentQuery.value = query;

  if (props.completeMethod) {
    loading.value = true;
    try {
      const results = await props.completeMethod(query);
      let suggestions = results;

      if (
        props.preventDuplicates &&
        props.multiple &&
        Array.isArray(props.modelValue)
      ) {
        suggestions = suggestions.filter(
          (item: any) => !isDuplicate(item, props.modelValue)
        );
      }

      if (
        props.allowCreate &&
        props.createMethod &&
        query.trim() &&
        !suggestions.some((item: any) => {
          const label = getOptionLabel(item);
          return label.toLowerCase() === query.toLowerCase().trim();
        })
      ) {
        suggestions = [
          {
            _isCreateOption: true,
            label: `${props.createLabel} "${query.trim()}"`,
            _createValue: query.trim(),
          },
          ...suggestions,
        ];
      }

      filteredSuggestions.value = suggestions;
    } catch (error) {
      console.error("Error in complete method:", error);
      filteredSuggestions.value = [];
    } finally {
      loading.value = false;
    }
  } else if (props.suggestions) {
    if (!query) {
      filteredSuggestions.value = props.suggestions;
    } else {
      const searchTerm = query.toLowerCase();
      let suggestions = props.suggestions.filter((item: any) => {
        const label = getOptionLabel(item);
        return label.toLowerCase().includes(searchTerm);
      });

      if (
        props.preventDuplicates &&
        props.multiple &&
        Array.isArray(props.modelValue)
      ) {
        suggestions = suggestions.filter(
          (item: any) => !isDuplicate(item, props.modelValue)
        );
      }

      if (
        props.allowCreate &&
        props.createMethod &&
        query.trim() &&
        !suggestions.some((item: any) => {
          const label = getOptionLabel(item);
          return label.toLowerCase() === query.toLowerCase().trim();
        })
      ) {
        suggestions = [
          {
            _isCreateOption: true,
            label: `${props.createLabel} "${query.trim()}"`,
            _createValue: query.trim(),
          },
          ...suggestions,
        ];
      }

      filteredSuggestions.value = suggestions;
    }
  } else {
    filteredSuggestions.value = [];
  }
};

const handleItemSelect = async (event: any) => {
  const selectedItem = event.value;

  if (
    selectedItem &&
    typeof selectedItem === "object" &&
    selectedItem._isCreateOption &&
    props.createMethod
  ) {
    if (event.originalEvent) {
      event.originalEvent.stopPropagation?.();
      event.originalEvent.preventDefault?.();
    }

    try {
      await createNewItem(selectedItem._createValue);
      currentQuery.value = "";
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  }
};

const createNewItem = async (query: string) => {
  if (!props.createMethod || !query.trim()) {
    return;
  }

  loading.value = true;
  try {
    const newItem = await props.createMethod(query.trim());
    return newItem;
  } catch (error) {
    console.error("Error creating new item:", error);
    throw error;
  } finally {
    loading.value = false;
  }
};

const handleUpdate = (value: any) => {
  let createOptionValue: string | null = null;

  if (props.multiple && Array.isArray(value)) {
    const createOption = value.find(
      (item: any) => item && typeof item === "object" && item._isCreateOption
    );

    if (createOption && props.createMethod) {
      createOptionValue = createOption._createValue;
      value = value.filter((item: any) => {
        return !(item && typeof item === "object" && item._isCreateOption);
      });
    } else {
      value = value.filter((item: any) => {
        return !(item && typeof item === "object" && item._isCreateOption);
      });
    }
  } else if (value && typeof value === "object" && value._isCreateOption) {
    if (props.createMethod) {
      createOptionValue = value._createValue;
    }
    if (createOptionValue) {
      createNewItem(createOptionValue);
    }
    return;
  }

  if (createOptionValue && props.createMethod) {
    createNewItem(createOptionValue).then((newItem) => {
      if (props.multiple && Array.isArray(value)) {
        const updatedValue = [...value];
        if (!isDuplicate(newItem, updatedValue)) {
          updatedValue.push(newItem);
          emit("update:modelValue", updatedValue);
        }
      }
    });
    return;
  }

  if (props.preventDuplicates && props.multiple && Array.isArray(value)) {
    const uniqueValues: any[] = [];
    const seen = new Set<string>();

    for (const item of value) {
      let key: string;
      if (typeof item === "string") {
        key = item;
      } else if (typeof item === "object" && item !== null) {
        key =
          item.id ||
          item[props.optionLabel] ||
          item.name ||
          JSON.stringify(item);
      } else {
        key = String(item);
      }

      if (!seen.has(key)) {
        seen.add(key);
        uniqueValues.push(item);
      }
    }

    emit("update:modelValue", uniqueValues);
  } else {
    emit("update:modelValue", value);
  }
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

.form-autocomplete {
  width: 100%;
}

.create-option {
  display: flex;
  align-items: center;
  color: var(--p-primary-color);
  font-weight: 500;
}
</style>
