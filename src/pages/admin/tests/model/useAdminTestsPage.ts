import { ref, reactive } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { Test } from "@features/admin-tests-table";
import type {
  AdminTestFormState,
  AdminTestModalSubmitPayload,
} from "@features/admin-test-modal";

export function useAdminTestsPage() {
  const toast = useToastClient();

  const modalVisible = ref(false);
  const formSubmitting = ref(false);
  const modalForm = ref<AdminTestFormState | null>(null);

  const createModalDefaults = (): AdminTestFormState => ({
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

  const mapTestToForm = (test: Test): AdminTestFormState => ({
    id: test.id,
    name: test.name,
    description: test.description ?? "",
    questionCount: test.questionCount,
    questionIdsRaw: Array.isArray(test.questionIds)
      ? test.questionIds.join(", ")
      : "",
    tags: test.tags ? [...test.tags] : [],
    primaryTag: test.primaryTag ?? null,
    isPublished: Boolean(test.isPublished),
    requiresPremium: Boolean(test.requiresPremium ?? false),
  });

  const openCreateModal = () => {
    modalForm.value = createModalDefaults();
    modalVisible.value = true;
  };

  const openEditModal = (test: Test) => {
    modalForm.value = mapTestToForm(test);
    modalVisible.value = true;
  };

  const closeModal = () => {
    modalVisible.value = false;
    modalForm.value = null;
  };

  const handleModalSubmit = async (
    payload: AdminTestModalSubmitPayload,
    refreshCallback: () => Promise<void>
  ) => {
    formSubmitting.value = true;

    try {
      const body = {
        name: payload.name,
        description: payload.description,
        questionCount: payload.questionCount,
        questionIds: payload.questionIds,
        tags: payload.tagIds,
        primaryTag: payload.primaryTagId,
        isPublished: payload.isPublished,
        requiresPremium: payload.requiresPremium,
      };

      if (payload.id) {
        await trpc.tests.update.mutate({
          id: payload.id,
          ...body,
        });
        toast.add({
          severity: "success",
          summary: "Сохранено",
          detail: "Тест обновлён",
        });
      } else {
        await trpc.tests.create.mutate(body);
        toast.add({
          severity: "success",
          summary: "Создано",
          detail: "Новый тест добавлен",
        });
      }

      closeModal();
      await refreshCallback();
      return true;
    } catch (error) {
      console.error("Ошибка при сохранении теста:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось сохранить тест",
      });
      return false;
    } finally {
      formSubmitting.value = false;
    }
  };

  return {
    modalVisible,
    formSubmitting,
    modalForm,
    openCreateModal,
    openEditModal,
    closeModal,
    handleModalSubmit,
  };
}

