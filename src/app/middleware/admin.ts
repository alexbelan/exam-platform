export default defineNuxtRouteMiddleware(async (to) => {
  // Получаем текущую сессию пользователя
  const { loggedIn, user } = useUserSession();

  // Проверяем, авторизован ли пользователь
  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  // Проверяем, является ли пользователь администратором
  if (user.value?.role !== "ADMIN") {
    return abortNavigation("Доступ запрещен. Требуются права администратора.");
  }
});
