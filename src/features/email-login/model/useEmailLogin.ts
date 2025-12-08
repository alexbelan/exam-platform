import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAsyncEmailLogin } from "./useAsyncEmailLogin";
import { useToastClient } from "@shared/hooks";

const RESEND_COOLDOWN_SECONDS = 60;

export function useEmailLogin() {
  const toast = useToastClient();
  const { fetch } = useUserSession();
  const { sendLoginCode, verifyLoginCode, resendLoginCode } =
    useAsyncEmailLogin();

  const step = ref<"email" | "code">("email");
  const email = ref("");
  const code = ref("");
  const loading = ref(false);
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

  const handleSendCode = async (emailValue: string): Promise<void> => {
    if (loading.value) return;

    if (!emailValue || !emailValue.trim()) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Пожалуйста, введите email",
      });
      return;
    }

    loading.value = true;

    try {
      await sendLoginCode(emailValue.trim());

      email.value = emailValue.trim();
      step.value = "code";
      startCountdown();

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: "Код для входа отправлен на email",
      });
    } catch (error: unknown) {
      console.error("Send login code error:", error);

      const errorMessage =
        (error as Error)?.message || "Произошла ошибка при отправке кода";

      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: errorMessage,
      });
    } finally {
      loading.value = false;
    }
  };

  const handleVerifyCode = async (
    codeValue: string,
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

    loading.value = true;

    try {
      const result = await verifyLoginCode(email.value, codeValue);

      if (result.success) {
        await fetch();

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: "Вход выполнен",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          await navigateTo("/");
        }
      }
    } catch (error: unknown) {
      console.error("Email login error:", error);

      const errorMessage =
        (error as Error)?.message || "Произошла ошибка при входе с кодом";

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
    if (!canResend.value || !email.value) return;

    loading.value = true;

    try {
      await resendLoginCode(email.value);

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
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (step.value === "code") {
      startCountdown();
    }
  });

  onUnmounted(() => {
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }
  });

  return {
    step,
    email,
    code,
    loading,
    canResend,
    resendCountdown,
    handleSendCode,
    handleVerifyCode,
    handleResend,
  };
}
