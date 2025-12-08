import { ref } from "vue";
import { useToastClient } from "@shared/hooks/useToastClient";

export function useAdminSettings() {
  const toast = useToastClient();

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
    toast.add({
      severity: "warn",
      summary: "Функционал в разработке",
      detail: "Сохранение настроек пока не реализовано",
    });
    // TODO: Здесь будет логика сохранения настроек в базу данных
  };

  const resetSettings = () => {
    toast.add({
      severity: "warn",
      summary: "Функционал в разработке",
      detail: "Сброс настроек пока не реализован",
    });
    // TODO: Здесь будет логика сброса настроек
  };

  const createBackup = () => {
    toast.add({
      severity: "warn",
      summary: "Функционал в разработке",
      detail: "Создание резервной копии пока не реализовано",
    });
    // TODO: Здесь будет логика создания резервной копии
  };

  const restoreBackup = () => {
    toast.add({
      severity: "warn",
      summary: "Функционал в разработке",
      detail: "Восстановление из резервной копии пока не реализовано",
    });
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
