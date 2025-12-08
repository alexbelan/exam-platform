import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAsyncPasswordReset } from "./useAsyncPasswordReset";
import { useToastClient } from "@shared/hooks";

const RESEND_COOLDOWN_SECONDS = 60;

export function usePasswordResetCode(email: string) {
  const toast = useToastClient();
  const { resetPasswordWithCode, resendCode } = useAsyncPasswordReset();

  const loading = ref(false);
  const code = ref("");
  const newPassword = ref("");
  const resendCountdown = ref(0);
  const countdownTimer = ref<NodeJS.Timeout | null>(null);

  const canResend = computed(() => resendCountdown.value === 0);

  const startCountdown = () => {
    resendCountdown.value = RESEND_COOLDOWN_SECONDS;

    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }

    countdownTimer.value = setInterval(() => {
      resendCountdown.value--;

      if (resendCountdown.value <= 0) {
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value);
          countdownTimer.value = null;
        }
      }
    }, 1000);
  };

  const handleSubmit = async (
    codeValue: string,
    passwordValue: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    if (loading.value) return;

    if (!codeValue || codeValue.length !== 6) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Код должен состоять из 6 цифр",
      });
      return;
    }

    if (!passwordValue || passwordValue.length < 8) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Пароль должен быть не менее 8 символов",
      });
      return;
    }

    loading.value = true;

    try {
      await resetPasswordWithCode(email, codeValue, passwordValue);

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Пароль успешно изменен",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        await navigateTo("/login");
      }
    } catch (error: unknown) {
      console.error("Password reset error:", error);

      const errorMessage =
        (error as Error)?.message || "Произошла ошибка при сбросе пароля";

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
      });
    } finally {
      loading.value = false;
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!canResend.value) return;

    try {
      await resendCode(email);

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Код отправлен повторно",
      });

      startCountdown();
    } catch (error: unknown) {
      console.error("Resend code error:", error);

      const errorMessage =
        (error as Error)?.message ||
        "Произошла ошибка при повторной отправке кода";

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
      });
    }
  };

  onMounted(() => {
    startCountdown();
  });

  onUnmounted(() => {
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }
  });

  return {
    loading,
    code,
    newPassword,
    canResend,
    resendCountdown,
    handleSubmit,
    handleResend,
  };
}
