import { ref, computed } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";
import type { User, AuthButtonProps } from "./types";

export function useAuthButton(props: AuthButtonProps = {}) {
  const { loggedIn, user, clear } = useUserSession();
  const toast = useToastClient();
  const loading = ref(false);

  const defaultProps: Required<
    Omit<AuthButtonProps, "text" | "rounded" | "disabled" | "severity">
  > = {
    loginLabel: "Войти",
    logoutLabel: "Выйти",
    loginIcon: "pi pi-sign-in",
    logoutIcon: "pi pi-sign-out",
  };

  const mergedProps = { ...defaultProps, ...props };

  const handleLogin = () => {
    navigateTo("/login");
  };

  const handleLogout = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
      await $fetch("/api/logout", { method: "POST" });
      await clear();
      toast.add({
        severity: "success",
        summary: "Выход",
        detail: "Вы успешно вышли из аккаунта",
      });
      await navigateTo("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось выйти из аккаунта",
      });
    } finally {
      loading.value = false;
    }
  };

  const buttonLabel = computed(() =>
    loggedIn.value ? mergedProps.logoutLabel : mergedProps.loginLabel
  );

  const buttonIcon = computed(() =>
    loggedIn.value ? mergedProps.logoutIcon : mergedProps.loginIcon
  );

  const computedSeverity = computed<"primary" | "danger">(() =>
    loggedIn.value ? "danger" : "primary"
  );

  const buttonSeverity = computed(
    () => props.severity || computedSeverity.value
  );

  const handleClick = () => {
    if (loggedIn.value) {
      handleLogout();
    } else {
      handleLogin();
    }
  };

  return {
    loggedIn: computed(() => loggedIn.value),
    user: computed(() => user.value as User | null),
    loading: computed(() => loading.value),
    buttonLabel,
    buttonIcon,
    buttonSeverity,
    handleClick,
    handleLogin,
    handleLogout,
  };
}
