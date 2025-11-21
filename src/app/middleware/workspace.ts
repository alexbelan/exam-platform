export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  const allowedRoles = new Set(["USER", "ADMIN"]);

  if (!allowedRoles.has(user.value?.role || "")) {
    return abortNavigation(
      "Доступ разрешен только авторизованным пользователям."
    );
  }
});
