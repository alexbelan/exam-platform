import { ref } from "vue";
import { useAsyncEmailLink } from "./useAsyncEmailLink";
import { useToastClient } from "@shared/hooks";
import type { EmailLinkFormData } from "./types";

export function useEmailLink() {
  const toast = useToastClient();
  const { sendEmailLinkCode } = useAsyncEmailLink();
  const loading = ref(false);
  const form = ref<EmailLinkFormData>({
    email: "",
  });

  const handleSubmit = async (
    onSubmitSuccess: (email: string) => void,
  ): Promise<void> => {
    if (loading.value) return;

    if (!form.value.email || !form.value.email.trim()) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Пожалуйста, введите email",
      });
      return;
    }

    loading.value = true;

    try {
      await sendEmailLinkCode(form.value.email.trim());

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Код для привязки email отправлен",
      });

      onSubmitSuccess(form.value.email.trim());
    } catch (error: unknown) {
      console.error("Email link error:", error);

      const errorMessage =
        (error as Error)?.message ||
        "Произошла ошибка при отправке кода для привязки email";

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
      });
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    form,
    handleSubmit,
  };
}
