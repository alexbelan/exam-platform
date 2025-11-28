import { computed, reactive, watch } from "vue";
import type {
  TagModalEmits,
  TagModalFormState,
  TagModalProps,
} from "./types";

export const useTagModal = (
  props: TagModalProps,
  emit: TagModalEmits
) => {
  const form = reactive<TagModalFormState>({
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
