import { reactive } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { CategoryTableItem } from "@features/admin-tag-categories-table";

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export function useAdminTagCategoriesPage() {
  const toast = useToastClient();

  const modal = reactive({
    visible: false,
    saving: false,
    category: null as CategoryTableItem | null,
  });

  const openEditModal = (category: CategoryTableItem) => {
    modal.category = category;
    modal.visible = true;
  };

  const closeModal = () => {
    modal.visible = false;
    modal.category = null;
  };

  const handleModalSave = async ({
    id,
    name,
    color,
  }: {
    id?: number;
    name: string;
    color: string;
  }) => {
    if (!id) return false;

    modal.saving = true;
    try {
      await trpc.tagCategories.update.mutate({
        id: id.toString(),
        name,
        color,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Категория обновлена",
      });

      closeModal();
      return true;
    } catch (error) {
      console.error("Ошибка при обновлении категории:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(error, "Не удалось обновить категорию"),
      });
      return false;
    } finally {
      modal.saving = false;
    }
  };

  return {
    modal,
    openEditModal,
    closeModal,
    handleModalSave,
  };
}

