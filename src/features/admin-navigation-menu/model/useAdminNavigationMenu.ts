import type { NavigationMenuItem } from "@entities/navigation-menu";

export function useAdminNavigationMenu() {
  const menuItems: NavigationMenuItem[] = [
    { to: "/admin", label: "Главная", icon: "pi pi-home" },
    { to: "/admin/users", label: "Пользователи", icon: "pi pi-users" },
    {
      to: "/admin/questions",
      label: "Вопросы",
      icon: "pi pi-question-circle",
    },
    { to: "/admin/tags", label: "Теги", icon: "pi pi-tags" },
    {
      to: "/admin/tag-categories",
      label: "Категории тегов",
      icon: "pi pi-sitemap",
    },
    { to: "/admin/tests", label: "Тесты", icon: "pi pi-list-check" },
    {
      to: "/admin/submissions",
      label: "Заявки",
      icon: "pi pi-file-edit",
    },
    { to: "/admin/settings", label: "Настройки", icon: "pi pi-cog" },
  ];

  const colors = {
    backgroundColor: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
    textColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  };

  return {
    menuItems,
    colors,
  };
}
