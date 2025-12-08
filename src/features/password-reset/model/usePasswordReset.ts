import { ref } from "vue";
import { useAsyncPasswordReset } from "./useAsyncPasswordReset";
import { useToastClient } from "@shared/hooks";
import type { PasswordResetFormData } from "./types";

export function usePasswordReset() {
  const toast = useToastClient();
  const { sendPasswordResetCode } = useAsyncPasswordReset();
  const loading = ref(false);
  const form = ref<PasswordResetFormData>({
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
      await sendPasswordResetCode(form.value.email.trim());

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Код для сброса пароля отправлен на email",
      });

      onSubmitSuccess(form.value.email.trim());
    } catch (error: unknown) {
      console.error("Password reset error:", error);

      const errorMessage =
        (error as Error)?.message ||
        "Произошла ошибка при отправке кода для сброса пароля";

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
