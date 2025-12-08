import { ref } from "vue";
import { useAsyncEmailRegistration } from "./useAsyncEmailRegistration";
import { useToastClient } from "@shared/hooks";
import type { EmailRegistrationFormData } from "./types";

export function useEmailRegistration() {
  const toast = useToastClient();
  const { sendRegistrationCode } = useAsyncEmailRegistration();
  const loading = ref(false);
  const form = ref<EmailRegistrationFormData>({
    email: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (
    onSubmitSuccess: (email: string) => void,
  ): Promise<void> => {
    if (loading.value) return;

    if (!form.value.email) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Пожалуйста, введите email",
      });
      return;
    }

    loading.value = true;

    try {
      await sendRegistrationCode({
        email: form.value.email,
        firstName: form.value.firstName || undefined,
        lastName: form.value.lastName || undefined,
      });

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Код регистрации отправлен на email",
      });

      onSubmitSuccess(form.value.email);
    } catch (error: unknown) {
      console.error("Email registration error:", error);

      const errorMessage =
        (error as Error)?.message ||
        "Произошла ошибка при отправке кода регистрации";

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
