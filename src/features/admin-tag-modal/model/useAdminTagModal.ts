import { computed, reactive, watch } from "vue";
import type {
  AdminTagModalEmits,
  AdminTagModalFormState,
  AdminTagModalProps,
} from "./types";

export const useAdminTagModal = (
  props: AdminTagModalProps,
  emit: AdminTagModalEmits
) => {
  const form = reactive<AdminTagModalFormState>({
    name: "",
    categoryId: null,
  });

  const isEditMode = computed(() => Boolean(props.tag?.id));

  const resetForm = () => {
    form.name = props.tag?.name ?? "";
    form.categoryId =
      props.tag?.category?.id ?? props.categories[0]?.id ?? null;
  };

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        resetForm();
      }
    },
    { immediate: true }
  );

  watch(
    () => [props.tag, props.categories] as const,
    () => {
      if (props.visible) {
        resetForm();
      }
    }
  );

  const close = () => {
    emit("update:visible", false);
    emit("cancel");
  };

  const save = () => {
    if (!form.name.trim() || form.categoryId === null) {
      return;
    }

    emit("save", {
      id: props.tag?.id,
      name: form.name.trim(),
      categoryId: form.categoryId,
    });
  };

  return {
    form,
    isEditMode,
    save,
    close,
  };
};
