import { ref } from "vue";
import { useAsyncLogin } from "@pages/login/model/useAsyncLogin";

export function useEmailLogin() {
  const { fetch } = useUserSession();
  const { loginWithEmail } = useAsyncLogin();
  const loading = ref(false);
  const email = ref("");
  const password = ref("");

  const handleEmailLogin = async () => {
    if (loading.value) return;

    if (!email.value || !password.value) {
      alert("Пожалуйста, введите email и пароль");
      return;
    }

    loading.value = true;

    try {
      const response = await loginWithEmail(email.value, password.value);

      if (response.success) {
        await fetch();
        await navigateTo("/");
      }
    } catch (error) {
      console.error("Email login error:", error);

      let errorMessage = "Произошла ошибка при входе";

      if ((error as { statusCode?: number })?.statusCode === 401) {
        errorMessage =
          (error as { statusMessage?: string })?.statusMessage ||
          "Неверный email или пароль";
      } else if ((error as { statusCode?: number })?.statusCode === 400) {
        errorMessage =
          (error as { statusMessage?: string })?.statusMessage ||
          "Неверные данные";
      }

      alert(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    email,
    password,
    handleEmailLogin,
  };
}

