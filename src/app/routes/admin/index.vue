<template>
  <div class="admin-dashboard">
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-icon users">
          <i class="pi pi-users"></i>
        </div>
        <div class="card-content">
          <h3>Пользователи</h3>
          <p class="card-number">{{ stats.users }}</p>
          <p class="card-description">Всего зарегистрированных</p>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-icon questions">
          <i class="pi pi-question-circle"></i>
        </div>
        <div class="card-content">
          <h3>Вопросы</h3>
          <p class="card-number">{{ stats.questions }}</p>
          <p class="card-description">Опубликованных вопросов</p>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-icon submissions">
          <i class="pi pi-file-edit"></i>
        </div>
        <div class="card-content">
          <h3>Заявки</h3>
          <p class="card-number">{{ stats.submissions }}</p>
          <p class="card-description">Ожидают рассмотрения</p>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-icon admins">
          <i class="pi pi-shield"></i>
        </div>
        <div class="card-content">
          <h3>Администраторы</h3>
          <p class="card-number">{{ stats.admins }}</p>
          <p class="card-description">Активных админов</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-activity">
        <h2>Последняя активность</h2>
        <div class="activity-list">
          <div class="activity-item">
            <i class="pi pi-user-plus activity-icon"></i>
            <div class="activity-content">
              <p>Новый пользователь зарегистрировался</p>
              <span class="activity-time">2 часа назад</span>
            </div>
          </div>
          <div class="activity-item">
            <i class="pi pi-file-edit activity-icon"></i>
            <div class="activity-content">
              <p>Получена новая заявка на рассмотрение</p>
              <span class="activity-time">4 часа назад</span>
            </div>
          </div>
          <div class="activity-item">
            <i class="pi pi-check-circle activity-icon"></i>
            <div class="activity-content">
              <p>Заявка одобрена</p>
              <span class="activity-time">6 часов назад</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Быстрые действия</h2>
        <div class="actions-grid">
          <Button
            label="Добавить вопрос"
            icon="pi pi-plus"
            class="action-btn"
            @click="navigateTo('/admin/questions')"
          />
          <Button
            label="Просмотреть заявки"
            icon="pi pi-eye"
            class="action-btn"
            @click="navigateTo('/admin/submissions')"
          />
          <Button
            label="Управление пользователями"
            icon="pi pi-users"
            class="action-btn"
            @click="navigateTo('/admin/users')"
          />
          <Button
            label="Настройки системы"
            icon="pi pi-cog"
            class="action-btn"
            @click="navigateTo('/admin/settings')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Используем middleware для проверки прав администратора
definePageMeta({
  middleware: "admin",
  layout: "admin",
  ssr: false,
});

// Моковые данные для демонстрации
const stats = ref({
  users: 1247,
  questions: 89,
  submissions: 12,
  admins: 3,
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.card-icon.users {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.card-icon.questions {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.card-icon.submissions {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.card-icon.admins {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: #7f8c8d;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.recent-activity,
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.recent-activity h2,
.quick-actions h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: #2c3e50;
}

.activity-time {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  width: 100%;
  padding: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
