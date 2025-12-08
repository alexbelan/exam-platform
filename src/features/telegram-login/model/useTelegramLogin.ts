import { ref, computed, onMounted } from "vue";
import { useAsyncLogin } from "@pages/login/model/useAsyncLogin";

export function useTelegramLogin() {
  const { fetch } = useUserSession();
  const { loginWithTelegram } = useAsyncLogin();
  const loading = ref(false);
  const isSubscribed = ref(true);

  // Проверяем, запущено ли приложение в Telegram
  const isTelegramWebApp = computed(() => {
    if (typeof window === "undefined") return false;
    return (
      (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram
        ?.WebApp !== undefined
    );
  });

  // Инициализация Telegram Web App
  onMounted(() => {
    if (isTelegramWebApp.value && typeof window !== "undefined") {
      const tg = (
        window as Window & {
          Telegram?: { WebApp?: { ready: () => void; expand: () => void } };
        }
      ).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }
    }
  });

  const openChannel = () => {
    // Замените на ваш канал или используйте переменную окружения
    const channelUsername = "your_channel_username"; // Без @
    if (typeof window !== "undefined") {
      const tg = (
        window as Window & {
          Telegram?: { WebApp?: { openTelegramLink: (url: string) => void } };
        }
      ).Telegram?.WebApp;
      tg?.openTelegramLink(`https://t.me/${channelUsername}`);
    }
  };

  const handleTelegramLogin = async () => {
    if (loading.value) return;

    loading.value = true;

    try {
      if (typeof window === "undefined") {
        throw new Error("Не удалось получить данные авторизации");
      }

      const tg = (
        window as Window & { Telegram?: { WebApp?: { initData: string } } }
      ).Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData) {
        throw new Error("Не удалось получить данные авторизации");
      }

      const response = await loginWithTelegram(initData);

      if (response.success) {
        await fetch();
        await navigateTo("/");
      }
    } catch (error) {
      console.error("Telegram login error:", error);

      let errorMessage = "Произошла ошибка при входе";

      if ((error as { statusCode?: number })?.statusCode === 403) {
        errorMessage = "Для доступа необходимо подписаться на канал";
        isSubscribed.value = false;
      } else if ((error as { statusCode?: number })?.statusCode === 401) {
        errorMessage =
          (error as { statusMessage?: string })?.statusMessage ||
          "Ошибка авторизации";
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
    isSubscribed,
    isTelegramWebApp,
    openChannel,
    handleTelegramLogin,
  };
}
