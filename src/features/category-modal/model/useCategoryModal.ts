import { computed, reactive, watch } from "vue";
import type {
  CategoryModalEmits,
  CategoryModalProps,
  AdminTagCategoryFormState,
} from "./types";

const DEFAULT_COLOR = "#3b82f6";

const normalizeHex = (value: string | null | undefined): string => {
  if (!value) {
    return DEFAULT_COLOR;
  }
  const hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    const expanded = hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }
  if (hex.length === 6) {
    return `#${hex.toLowerCase()}`;
  }
  return DEFAULT_COLOR;
};

export const useCategoryModal = (
  props: CategoryModalProps,
  emit: CategoryModalEmits
) => {
  const form = reactive<AdminTagCategoryFormState>({
    name: "",
    color: props.defaultColor
      ? normalizeHex(props.defaultColor)
      : DEFAULT_COLOR,
  });

  const isEditMode = computed(() => Boolean(props.category?.id));

  const resetForm = () => {
    form.name = props.category?.name ?? "";
    form.color = normalizeHex(
      props.category?.color ?? props.defaultColor ?? DEFAULT_COLOR
    );
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
    () => props.category,
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
    if (!form.name.trim()) {
      return;
    }

    emit("save", {
      id: props.category?.id,
      name: form.name.trim(),
      color: normalizeHex(form.color),
    });
  };

  return {
    form,
    isEditMode,
    save,
    close,
    normalizeHex,
  };
};

export const TAG_CATEGORY_DEFAULT_COLOR = DEFAULT_COLOR;
