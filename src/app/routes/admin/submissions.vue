<template>
  <div class="admin-submissions">
    <div class="page-header">
      <h1>Заявки пользователей</h1>
      <div class="header-actions">
        <Button
          label="Экспорт"
          icon="pi pi-download"
          severity="secondary"
          @click="exportSubmissions"
        />
        <Button
          label="Массовые действия"
          icon="pi pi-check-square"
          severity="info"
          @click="showBulkActions = true"
        />
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Поиск:</label>
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по заголовку или содержанию..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <label>Статус:</label>
        <Dropdown
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Все статусы"
          class="status-dropdown"
        />
      </div>
      <div class="filter-group">
        <label>Дата:</label>
        <Calendar
          v-model="selectedDate"
          placeholder="Выберите дату"
          class="date-picker"
        />
      </div>
    </div>

    <div class="submissions-table">
      <DataTable
        :value="filteredSubmissions"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 25]"
        class="p-datatable-sm"
        selectionMode="multiple"
        v-model:selection="selectedSubmissions"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="title" header="Заголовок" sortable>
          <template #body="{ data }">
            <div class="submission-title">
              {{ data.title }}
              <div class="submission-meta">
                <span class="user-info"
                  >{{ data.user.firstName }} {{ data.user.lastName }}</span
                >
                <span class="email">{{ data.user.email }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column field="content" header="Содержание">
          <template #body="{ data }">
            <div class="submission-content">
              {{ truncateText(data.content, 100) }}
            </div>
          </template>
        </Column>
        <Column field="status" header="Статус" sortable>
          <template #body="{ data }">
            <Tag
              :value="getStatusLabel(data.status)"
              :severity="getStatusSeverity(data.status)"
            />
          </template>
        </Column>
        <Column field="createdAt" header="Дата подачи" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>
        <Column header="Действия">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                severity="info"
                text
                rounded
                @click="viewSubmission(data)"
              />
              <Button
                v-if="data.status === 'PENDING'"
                icon="pi pi-check"
                severity="success"
                text
                rounded
                @click="approveSubmission(data)"
              />
              <Button
                v-if="data.status === 'PENDING'"
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                @click="rejectSubmission(data)"
              />
              <Button
                icon="pi pi-reply"
                severity="warning"
                text
                rounded
                @click="replyToSubmission(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Модальное окно просмотра заявки -->
    <Dialog
      v-model:visible="showSubmissionModal"
      :header="`Заявка: ${selectedSubmission?.title}`"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedSubmission" class="submission-details">
        <div class="submission-header">
          <div class="submission-info">
            <h3>{{ selectedSubmission.title }}</h3>
            <div class="submission-meta">
              <span
                ><strong>Автор:</strong>
                {{ selectedSubmission.user.firstName }}
                {{ selectedSubmission.user.lastName }}</span
              >
              <span
                ><strong>Email:</strong>
                {{ selectedSubmission.user.email }}</span
              >
              <span
                ><strong>Дата:</strong>
                {{ formatDate(selectedSubmission.createdAt) }}</span
              >
              <span
                ><strong>Статус:</strong>
                <Tag
                  :value="getStatusLabel(selectedSubmission.status)"
                  :severity="getStatusSeverity(selectedSubmission.status)"
                />
              </span>
            </div>
          </div>
        </div>

        <div class="submission-body">
          <h4>Содержание заявки:</h4>
          <div class="content-text">
            {{ selectedSubmission.content }}
          </div>

          <div v-if="selectedSubmission.adminResponse" class="admin-response">
            <h4>Ответ администратора:</h4>
            <div class="response-text">
              {{ selectedSubmission.adminResponse }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Закрыть"
          severity="secondary"
          @click="showSubmissionModal = false"
        />
        <Button
          v-if="selectedSubmission?.status === 'PENDING'"
          label="Одобрить"
          severity="success"
          @click="approveSubmission(selectedSubmission)"
        />
        <Button
          v-if="selectedSubmission?.status === 'PENDING'"
          label="Отклонить"
          severity="danger"
          @click="rejectSubmission(selectedSubmission)"
        />
      </template>
    </Dialog>

    <!-- Модальное окно ответа на заявку -->
    <Dialog
      v-model:visible="showReplyModal"
      header="Ответ на заявку"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="reply-form">
        <div class="form-group">
          <label>Ответ администратора:</label>
          <Textarea
            v-model="replyText"
            rows="6"
            placeholder="Введите ваш ответ..."
          />
        </div>
        <div class="form-group">
          <Checkbox v-model="sendEmail" binary />
          <label class="checkbox-label"
            >Отправить ответ на email пользователя</label
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отмена" severity="secondary" @click="closeReplyModal" />
        <Button label="Отправить ответ" @click="sendReply" />
      </template>
    </Dialog>
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
const submissions = ref([
  {
    id: "1",
    title: "Вопрос о React хуках",
    content:
      "Не могу понять, как правильно использовать useEffect с зависимостями. Можете объяснить на примере?",
    status: "PENDING",
    adminResponse: null,
    isResponseSent: false,
    createdAt: new Date("2024-01-15"),
    user: {
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan@example.com",
    },
  },
  {
    id: "2",
    title: "Проблема с асинхронным кодом",
    content:
      "У меня есть проблема с Promise.all, не понимаю почему не работает как ожидается...",
    status: "APPROVED",
    adminResponse: "Отличный вопрос! Вот подробное объяснение с примерами...",
    isResponseSent: true,
    createdAt: new Date("2024-01-10"),
    user: {
      firstName: "Мария",
      lastName: "Сидорова",
      email: "maria@example.com",
    },
  },
  {
    id: "3",
    title: "Архитектура микросервисов",
    content:
      "Хочу узнать больше о том, как правильно проектировать микросервисы...",
    status: "NEEDS_REVISION",
    adminResponse:
      "Ваш вопрос слишком общий. Пожалуйста, уточните конкретные аспекты...",
    isResponseSent: true,
    createdAt: new Date("2024-01-05"),
    user: {
      firstName: "Алексей",
      lastName: "Козлов",
      email: "alex@example.com",
    },
  },
]);

const loading = ref(false);
const searchQuery = ref("");
const selectedStatus = ref(null);
const selectedDate = ref(null);
const selectedSubmissions = ref([]);
const showSubmissionModal = ref(false);
const showReplyModal = ref(false);
const showBulkActions = ref(false);
const selectedSubmission = ref(null);
const replyText = ref("");
const sendEmail = ref(true);

const statusOptions = [
  { label: "Ожидает", value: "PENDING" },
  { label: "Одобрена", value: "APPROVED" },
  { label: "Отклонена", value: "REJECTED" },
  { label: "Требует доработки", value: "NEEDS_REVISION" },
];

const filteredSubmissions = computed(() => {
  let filtered = submissions.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (submission) =>
        submission.title.toLowerCase().includes(query) ||
        submission.content.toLowerCase().includes(query) ||
        submission.user.firstName.toLowerCase().includes(query) ||
        submission.user.lastName.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(
      (submission) => submission.status === selectedStatus.value
    );
  }

  if (selectedDate.value) {
    const date = new Date(selectedDate.value);
    filtered = filtered.filter((submission) => {
      const submissionDate = new Date(submission.createdAt);
      return submissionDate.toDateString() === date.toDateString();
    });
  }

  return filtered;
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Ожидает",
    APPROVED: "Одобрена",
    REJECTED: "Отклонена",
    NEEDS_REVISION: "Требует доработки",
  };
  return labels[status] || status;
};

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    NEEDS_REVISION: "info",
  };
  return severities[status] || "info";
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU").format(date);
};

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const viewSubmission = (submission: any) => {
  selectedSubmission.value = submission;
  showSubmissionModal.value = true;
};

const approveSubmission = (submission: any) => {
  submission.status = "APPROVED";
  console.log("Одобрение заявки:", submission);
};

const rejectSubmission = (submission: any) => {
  submission.status = "REJECTED";
  console.log("Отклонение заявки:", submission);
};

const replyToSubmission = (submission: any) => {
  selectedSubmission.value = submission;
  replyText.value = "";
  sendEmail.value = true;
  showReplyModal.value = true;
};

const closeReplyModal = () => {
  showReplyModal.value = false;
  selectedSubmission.value = null;
  replyText.value = "";
  sendEmail.value = true;
};

const sendReply = () => {
  if (selectedSubmission.value && replyText.value) {
    selectedSubmission.value.adminResponse = replyText.value;
    selectedSubmission.value.isResponseSent = sendEmail.value;
    console.log("Отправка ответа:", {
      submission: selectedSubmission.value,
      reply: replyText.value,
      sendEmail: sendEmail.value,
    });
    closeReplyModal();
  }
};

const exportSubmissions = () => {
  console.log("Экспорт заявок");
};
</script>

<style scoped>
.admin-submissions {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 2rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.search-input {
  width: 300px;
}

.status-dropdown,
.date-picker {
  width: 150px;
}

.submissions-table {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.submission-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submission-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #7f8c8d;
}

.user-info {
  font-weight: 500;
  color: #2c3e50;
}

.email {
  font-size: 0.8rem;
}

.submission-content {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.submission-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.submission-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.submission-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.submission-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.submission-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submission-body h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.content-text,
.response-text {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
}

.admin-response {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>
