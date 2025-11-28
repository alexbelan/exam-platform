import { reactive } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import { trpc } from "#shared/lib/trpc";
import type { Tag } from "@features/admin-tags-table";
import type { CategoryEntity } from "@entities/category";
import { AdminTagModal } from "@features/admin-tag-modal";

const extractErrorMessage = (error: any, fallback: string) =>
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  fallback;

export function useAdminTagsPage() {
  const toast = useToastClient();

  const tagModal = reactive({
    visible: false,
    saving: false,
    tag: null as Tag | null,
    categories: [] as CategoryEntity[],
  });

  const openTagModal = (tag?: Tag | null, categories: CategoryEntity[] = []) => {
    tagModal.tag = tag ?? null;
    tagModal.categories = categories;
    tagModal.visible = true;
  };

  const closeTagModal = () => {
    tagModal.visible = false;
    tagModal.tag = null;
  };

  const handleTagModalSave = async ({
    id,
    name,
    categoryId,
  }: {
    id?: number;
    name: string;
    categoryId: number;
  }) => {
    const payload = {
      name,
      categoryId,
    };
    const isUpdate = Boolean(id);
    tagModal.saving = true;
    try {
      if (isUpdate && id) {
        await trpc.tags.update.mutate({
          id: id.toString(),
          name: payload.name,
          categoryId: payload.categoryId?.toString() || null,
        });
        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Тег обновлен",
        });
      } else {
        await trpc.tags.create.mutate({
          name: payload.name,
          categoryId: payload.categoryId?.toString(),
        });
        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Тег создан",
        });
      }
      closeTagModal();
      // Возвращаем true для успешного сохранения, обновление данных будет в page компоненте
      return true;
    } catch (error) {
      console.error("Ошибка при обновлении тега:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: extractErrorMessage(error, "Не удалось обновить тег"),
      });
      return false;
    } finally {
      tagModal.saving = false;
    }
  };

  return {
    tagModal,
    openTagModal,
    closeTagModal,
    handleTagModalSave,
  };
}

