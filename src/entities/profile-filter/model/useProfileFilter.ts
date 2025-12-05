import type { Ref } from "vue";
import type { ProfileContentFilter } from "@entities/profile-state";

export function useProfileFilter(modelValue: Ref<ProfileContentFilter>) {
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

  const selectFilter = (key: ProfileContentFilter) => {
    // defineModel автоматически обработает update:modelValue
    modelValue.value = key;
  };

  return {
    filters,
    selectFilter,
  };
}
