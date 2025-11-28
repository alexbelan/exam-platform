import { ref } from "vue";

export function useAdminSettings() {
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
    // TODO: Здесь будет логика сохранения настроек в базу данных
  };

  const resetSettings = () => {
    console.log("Сброс настроек к значениям по умолчанию");
    // TODO: Здесь будет логика сброса настроек
  };

  const createBackup = () => {
    console.log("Создание резервной копии");
    // TODO: Здесь будет логика создания резервной копии
  };

  const restoreBackup = () => {
    console.log("Восстановление из резервной копии");
    // TODO: Здесь будет логика восстановления из резервной копии
  };

  return {
    settings,
    backupFrequencyOptions,
    saveSettings,
    resetSettings,
    createBackup,
    restoreBackup,
  };
}

