import { computed } from "vue";
import type { NavigationMenuItem } from "@entities/navigation-menu";

export function useWorkspaceNavigationMenu() {
  const { user } = useUserSession();

  const userName = computed(() => {
    if (!user.value) return "Профиль";
    const userData = user.value as { firstName?: string | null } | null;
    return userData?.firstName || "Профиль";
  });

  const menuItems = computed<NavigationMenuItem[]>(() => [
    {
      to: "/workspace/profile",
      label: userName.value,
      icon: "pi pi-user",
    },
    {
      to: "/workspace/questions",
      label: "Вопросы",
      icon: "pi pi-question-circle",
    },
    { to: "/workspace/tests", label: "Тесты", icon: "pi pi-list-check" },
    { to: "/workspace/settings", label: "Настройки", icon: "pi pi-cog" },
  ]);

  const colors = {
    backgroundColor: "white",
    textColor: "#495057",
    borderColor: "#e9ecef",
  };

  return {
    menuItems,
    colors,
  };
}
