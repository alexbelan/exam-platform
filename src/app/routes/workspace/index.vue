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

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

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

<style scoped>
.workspace-dashboard {
  display: grid;
  gap: 2rem;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-card h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.welcome-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0d6efd;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.recent-section {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.recent-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.review-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
}

.review-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: #111827;
}

.review-meta {
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 1.5rem;
  }

  .recent-section {
    padding: 1.5rem;
  }

  .review-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
