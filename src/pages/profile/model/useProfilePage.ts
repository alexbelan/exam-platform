import { computed } from "vue";
import { useProfileStateStore } from "@entities/profile-state";
import { useProfileStatistics } from "@features/profile-statistics";

export function useProfilePage() {
  const { user } = useUserSession();
  const store = useProfileStateStore();

  // Данные пользователя для хедера
  const userData = computed(() => {
    if (!user.value) {
      return {
        id: 0,
        email: "",
        firstName: null,
        lastName: null,
        avatar: null,
      };
    }
    return {
      id: user.value.id,
      email: user.value.email,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      avatar: null, // TODO: добавить аватар в схему
    };
  });

  // Активный фильтр
  const activeFilter = computed({
    get: () => store.activeFilter,
    set: (value) => store.setActiveFilter(value),
  });

  // Статистика
  const { statistics, pending: statisticsPending } = useProfileStatistics();

  // Преобразуем computed в значения для props
  const statisticsValue = computed(() => statistics.value);
  const statisticsPendingValue = computed(() => statisticsPending.value);

  return {
    userData,
    activeFilter,
    statisticsValue,
    statisticsPendingValue,
  };
}
