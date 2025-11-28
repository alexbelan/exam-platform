import { computed, reactive, watch } from "vue";
import type {
  TestFormState,
  TestModalEmits,
  TestModalProps,
  TestModalSubmitPayload,
} from "./types";

const createDefaultForm = (): TestFormState => ({
  id: null,
  name: "",
  description: "",
  questionCount: 10,
  questionIdsRaw: "",
  tags: [],
  primaryTag: null,
  isPublished: false,
  requiresPremium: false,
});

export function useTestModal(
  props: TestModalProps,
  emit: TestModalEmits
) {
  const form = reactive<TestFormState>(createDefaultForm());

  const errors = reactive({
    name: "",
    questionCount: "",
  });

  const visibleValue = computed(() => props.visible);
  const savingValue = computed(() => props.saving);
  const tagOptionsValue = computed(() => props.tagOptions);
  const secondaryTagOptions = computed(() =>
    tagOptionsValue.value.filter((option) => option.id !== form.primaryTag?.id)
  );
  const tagsLoadingValue = computed(() => props.tagsLoading);
  const modalTitle = computed(() =>
    form.id ? "Редактирование теста" : "Новый тест"
  );

  const resetErrors = () => {
    errors.name = "";
    errors.questionCount = "";
  };

  const setForm = (value: TestFormState) => {
    form.id = value.id;
    form.name = value.name;
    form.description = value.description;
    form.questionCount = value.questionCount;
    form.questionIdsRaw = value.questionIdsRaw;
    form.tags = value.tags ? [...value.tags] : [];
    form.primaryTag = value.primaryTag ?? null;
    form.isPublished = value.isPublished ?? false;
    form.requiresPremium = value.requiresPremium ?? false;
  };

  const initializeForm = (value: TestFormState | null) => {
    const next = value ? { ...value } : createDefaultForm();
    if (next.tags) {
      next.tags = [...next.tags];
    }
    setForm(next);
    resetErrors();
  };

  const updateVisible = (value: boolean) => {
    emit("update:visible", value);
    if (!value) {
      resetErrors();
    }
  };

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initializeForm(props.value);
      }
    },
    { immediate: true }
  );

  watch(
    () => props.value,
    (value) => {
      if (props.visible) {
        initializeForm(value);
      }
    }
  );

  const parseQuestionIds = (value: string) =>
    value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);

  const validateForm = () => {
    let valid = true;
    resetErrors();

    if (!form.name.trim()) {
      errors.name = "Введите название теста";
      valid = false;
    }

    if (!form.questionCount || form.questionCount <= 0) {
      errors.questionCount = "Количество вопросов должно быть больше нуля";
      valid = false;
    }

    return valid;
  };

  watch(
    () => form.primaryTag?.id,
    (primaryId) => {
      if (!primaryId) {
        return;
      }
      form.tags = form.tags.filter((tag) => tag.id !== primaryId);
    }
  );

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const payload: TestModalSubmitPayload = {
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      questionCount: form.questionCount,
      questionIds: parseQuestionIds(form.questionIdsRaw),
      tagIds: form.tags.map((tag) => tag.id),
      primaryTagId: form.primaryTag?.id ?? null,
      isPublished: form.isPublished,
      requiresPremium: form.requiresPremium,
    };

    emit("submit", payload);
  };

  const handleCancel = () => {
    emit("cancel");
    emit("update:visible", false);
  };

  return {
    form,
    errors,
    modalTitle,
    visibleValue,
    savingValue,
    tagOptionsValue,
    secondaryTagOptions,
    tagsLoadingValue,
    handleSubmit,
    handleCancel,
    updateVisible,
  };
}
