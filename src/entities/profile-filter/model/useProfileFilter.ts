import { computed } from "vue";
import type { Ref } from "vue";
import type { ProfileContentFilter } from "@entities/profile-state";
import type { ProfileFilterEmits } from "./types";

export function useProfileFilter(
  modelValue: Ref<ProfileContentFilter>,
  emit: ProfileFilterEmits
) {
  const filters: Array<{
    key: ProfileContentFilter;
    label: string;
    icon: string;
  }> = [
    {
      key: "favorite-questions",
      label: "Избранные вопросы",
      icon: "pi pi-bookmark",
    },
    {
      key: "favorite-tests",
      label: "Избранные тесты",
      icon: "pi pi-star",
    },
    {
      key: "incorrect-answers",
      label: "Неправильные ответы",
      icon: "pi pi-times-circle",
    },
  ];

  const isSelected = (key: ProfileContentFilter) => {
    return modelValue.value === key;
  };

  const selectFilter = (key: ProfileContentFilter) => {
    modelValue.value = key;
    emit("update:modelValue", key);
  };

  return {
    filters,
    isSelected,
    selectFilter,
  };
}

