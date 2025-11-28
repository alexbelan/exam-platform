import { reactive } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { normalizeHex } from "@shared/utils/color";
import { TAG_CATEGORY_DEFAULT_COLOR } from "@features/category-modal/model/useCategoryModal";
import type { CategoryFormData } from "./types";

export function useCategoryForm(
  onSubmit: (data: { name: string; color: string }) => Promise<void>
) {
  const toast = useToastClient();

  const form = reactive<CategoryFormData>({
    name: "",
    color: TAG_CATEGORY_DEFAULT_COLOR,
  });

  const creating = ref(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.add({
        severity: "warn",
        summary: "Предупреждение",
        detail: "Введите название категории",
      });
      return;
    }

    creating.value = true;
    try {
      await onSubmit({
        name: form.name.trim(),
        color: normalizeHex(form.color) || TAG_CATEGORY_DEFAULT_COLOR,
      });

      form.name = "";
      form.color = TAG_CATEGORY_DEFAULT_COLOR;
    } finally {
      creating.value = false;
    }
  };

  return {
    form,
    creating,
    handleSubmit,
  };
}

