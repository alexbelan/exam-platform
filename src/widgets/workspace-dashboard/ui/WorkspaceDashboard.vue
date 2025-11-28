<template>
  <div class="workspace-dashboard">
    <section class="welcome-card">
      <h2>Привет, {{ displayName }} 👋</h2>
      <p>
        Здесь собраны ваши вопросы, тесты и настройки. Продолжайте обучение и
        следите за прогрессом.
      </p>
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-value">{{ stats.completedTests }}</span>
          <span class="stat-label">Пройдено тестов</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ stats.savedQuestions }}</span>
          <span class="stat-label">Сохранено вопросов</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ stats.streakDays }}</span>
          <span class="stat-label">Дни подряд</span>
        </div>
      </div>
      <div class="actions">
        <Button
          label="Продолжить тест"
          icon="pi pi-play"
          @click="navigateTo('/workspace/tests')"
        />
        <Button
          label="Открыть вопросы"
          icon="pi pi-question-circle"
          severity="secondary"
          outlined
          @click="navigateTo('/workspace/questions')"
        />
      </div>
    </section>

    <section class="recent-section">
      <h3>Недавняя активность</h3>
      <ul class="review-list">
        <li v-for="item in recentActivity" :key="item.id" class="review-item">
          <div>
            <p class="review-title">{{ item.title }}</p>
            <span class="review-meta">{{ item.description }}</span>
          </div>
          <UiTag
            :label="item.typeLabel"
            :color="getActivityColor(item.typeLabel)"
            size="sm"
            pill
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Tag as UiTag } from "@shared/ui";

const { user } = useUserSession();

const displayName = computed(() => {
  const current = user.value;
  if (!current) {
    return "участник";
  }
  const name = [current.firstName, current.lastName].filter(Boolean).join(" ");
  return name || current.email || "участник";
});

const stats = reactive({
  completedTests: 0,
  savedQuestions: 0,
  streakDays: 0,
});

const recentActivity = ref([
  {
    id: "activity-test",
    title: "Продолжите тест «JavaScript основы»",
    description: "Последний прогресс сохранен 2 часа назад",
    typeLabel: "Тест",
  },
  {
    id: "activity-question",
    title: "У вас 5 новых вопросов из категории «Frontend»",
    description: "Добавлены 1 день назад",
    typeLabel: "Вопросы",
  },
  {
    id: "activity-profile",
    title: "Заполните профиль, чтобы открывать курсы",
    description: "Напоминание",
    typeLabel: "Профиль",
  },
]);

const ACTIVITY_TYPE_COLOR_MAP: Record<string, string> = {
  Тест: "{blue.500}",
  Вопросы: "{purple.500}",
  Профиль: "{slate.600}",
};

const getActivityColor = (label: string) =>
  ACTIVITY_TYPE_COLOR_MAP[label] ?? "{slate.700}";
</script>

<style scoped src="../style/workspace-dashboard.css"></style>

