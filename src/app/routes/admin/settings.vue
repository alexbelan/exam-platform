<template>
  <div class="admin-settings">
    <div class="page-header">
      <h1>Настройки системы</h1>
    </div>

    <div class="settings-sections">
      <!-- Общие настройки -->
      <div class="settings-section">
        <h2>Общие настройки</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Название сайта:</label>
            <InputText v-model="settings.siteName" />
          </div>
          <div class="form-group">
            <label>Описание сайта:</label>
            <Textarea v-model="settings.siteDescription" rows="3" />
          </div>
          <div class="form-group">
            <label>Email администратора:</label>
            <InputText v-model="settings.adminEmail" type="email" />
          </div>
          <div class="form-group">
            <label>Количество вопросов на странице:</label>
            <InputNumber
              v-model="settings.questionsPerPage"
              :min="5"
              :max="50"
            />
          </div>
        </div>
      </div>

      <!-- Настройки регистрации -->
      <div class="settings-section">
        <h2>Настройки регистрации</h2>
        <div class="settings-form">
          <div class="form-group">
            <Checkbox v-model="settings.allowRegistration" binary />
            <label class="checkbox-label"
              >Разрешить регистрацию новых пользователей</label
            >
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.requireEmailVerification" binary />
            <label class="checkbox-label">Требовать подтверждение email</label>
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.autoApproveUsers" binary />
            <label class="checkbox-label"
              >Автоматически одобрять новых пользователей</label
            >
          </div>
        </div>
      </div>

      <!-- Настройки вопросов -->
      <div class="settings-section">
        <h2>Настройки вопросов</h2>
        <div class="settings-form">
          <div class="form-group">
            <Checkbox v-model="settings.allowUserSubmissions" binary />
            <label class="checkbox-label"
              >Разрешить пользователям подавать вопросы</label
            >
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.autoPublishQuestions" binary />
            <label class="checkbox-label"
              >Автоматически публиковать одобренные вопросы</label
            >
          </div>
          <div class="form-group">
            <label>Максимальная длина вопроса:</label>
            <InputNumber
              v-model="settings.maxQuestionLength"
              :min="100"
              :max="10000"
            />
          </div>
        </div>
      </div>

      <!-- Настройки уведомлений -->
      <div class="settings-section">
        <h2>Настройки уведомлений</h2>
        <div class="settings-form">
          <div class="form-group">
            <Checkbox v-model="settings.emailNotifications" binary />
            <label class="checkbox-label">Включить email уведомления</label>
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.notifyNewSubmissions" binary />
            <label class="checkbox-label">Уведомлять о новых заявках</label>
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.notifyNewUsers" binary />
            <label class="checkbox-label"
              >Уведомлять о новых пользователях</label
            >
          </div>
        </div>
      </div>

      <!-- Настройки безопасности -->
      <div class="settings-section">
        <h2>Настройки безопасности</h2>
        <div class="settings-form">
          <div class="form-group">
            <label>Время жизни сессии (часы):</label>
            <InputNumber
              v-model="settings.sessionTimeout"
              :min="1"
              :max="168"
            />
          </div>
          <div class="form-group">
            <label>Максимальное количество попыток входа:</label>
            <InputNumber
              v-model="settings.maxLoginAttempts"
              :min="3"
              :max="10"
            />
          </div>
          <div class="form-group">
            <Checkbox v-model="settings.enableTwoFactor" binary />
            <label class="checkbox-label"
              >Включить двухфакторную аутентификацию</label
            >
          </div>
        </div>
      </div>

      <!-- Настройки резервного копирования -->
      <div class="settings-section">
        <h2>Резервное копирование</h2>
        <div class="settings-form">
          <div class="form-group">
            <Checkbox v-model="settings.autoBackup" binary />
            <label class="checkbox-label"
              >Автоматическое резервное копирование</label
            >
          </div>
          <div class="form-group">
            <label>Частота резервного копирования:</label>
            <Dropdown
              v-model="settings.backupFrequency"
              :options="backupFrequencyOptions"
            />
          </div>
          <div class="form-group">
            <label>Количество хранимых копий:</label>
            <InputNumber
              v-model="settings.backupRetention"
              :min="1"
              :max="30"
            />
          </div>
          <div class="form-actions">
            <Button
              label="Создать резервную копию"
              icon="pi pi-download"
              severity="info"
              @click="createBackup"
            />
            <Button
              label="Восстановить из копии"
              icon="pi pi-upload"
              severity="warning"
              @click="restoreBackup"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <div class="footer-actions">
        <Button
          label="Сбросить настройки"
          severity="danger"
          outlined
          @click="resetSettings"
        />
        <Button label="Сохранить изменения" @click="saveSettings" />
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

// Моковые данные настроек
const settings = ref({
  siteName: "Платформа для тестирования",
  siteDescription:
    "Платформа для прохождения тестов и подготовки к экзаменам",
  adminEmail: "admin@example.com",
  questionsPerPage: 10,
  allowRegistration: true,
  requireEmailVerification: false,
  autoApproveUsers: true,
  allowUserSubmissions: true,
  autoPublishQuestions: false,
  maxQuestionLength: 5000,
  emailNotifications: true,
  notifyNewSubmissions: true,
  notifyNewUsers: false,
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  enableTwoFactor: false,
  autoBackup: true,
  backupFrequency: "daily",
  backupRetention: 7,
});

const backupFrequencyOptions = [
  { label: "Ежедневно", value: "daily" },
  { label: "Еженедельно", value: "weekly" },
  { label: "Ежемесячно", value: "monthly" },
];

const saveSettings = () => {
  console.log("Сохранение настроек:", settings.value);
  // Здесь будет логика сохранения настроек в базу данных
};

const resetSettings = () => {
  console.log("Сброс настроек к значениям по умолчанию");
  // Здесь будет логика сброса настроек
};

const createBackup = () => {
  console.log("Создание резервной копии");
  // Здесь будет логика создания резервной копии
};

const restoreBackup = () => {
  console.log("Восстановление из резервной копии");
  // Здесь будет логика восстановления из резервной копии
};
</script>

<style scoped>
.admin-settings {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.settings-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.settings-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .settings-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .footer-actions {
    flex-direction: column;
  }
}
</style>
