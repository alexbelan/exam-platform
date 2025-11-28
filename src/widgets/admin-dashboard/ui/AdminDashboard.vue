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
const stats = ref({
  users: 1247,
  questions: 89,
  submissions: 12,
  admins: 3,
});
</script>

<style scoped src="../style/admin-dashboard.css"></style>

