<template>
  <Dialog
    :visible="props.visible"
    @update:visible="$emit('update:visible', $event)"
    :header="`Заявка: ${props.submission?.title}`"
    :modal="true"
    :style="{ width: '800px' }"
  >
    <div v-if="props.submission" class="submission-details">
      <div class="submission-header">
        <div class="submission-info">
          <h3>{{ props.submission.title }}</h3>
          <div class="submission-meta">
            <span
              ><strong>Автор:</strong>
              {{ props.submission.user.firstName }}
              {{ props.submission.user.lastName }}</span
            >
            <span
              ><strong>Email:</strong> {{ props.submission.user.email }}</span
            >
            <span
              ><strong>Дата:</strong>
              {{ formatDate(props.submission.createdAt) }}</span
            >
            <span
              ><strong>Статус:</strong>
              <Tag
                :value="getStatusLabel(props.submission.status)"
                :severity="getStatusSeverity(props.submission.status)"
              />
            </span>
          </div>
        </div>
      </div>

      <div class="submission-body">
        <h4>Содержание заявки:</h4>
        <div class="content-text">
          {{ props.submission.content }}
        </div>

        <div v-if="props.submission.adminResponse" class="admin-response">
          <h4>Ответ администратора:</h4>
          <div class="response-text">
            {{ props.submission.adminResponse }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Закрыть"
        severity="secondary"
        @click="$emit('update:visible', false)"
      />
      <Button
        v-if="props.submission?.status === 'PENDING'"
        label="Одобрить"
        severity="success"
        @click="handleApprove"
      />
      <Button
        v-if="props.submission?.status === 'PENDING'"
        label="Отклонить"
        severity="danger"
        @click="handleReject"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
import {
  formatDate,
  getStatusLabel,
  getStatusSeverity,
} from "@features/submissions-table";
import type {
  SubmissionModalProps,
  SubmissionModalEmits,
} from "../model/types";

const props = defineProps<SubmissionModalProps>();
const emit = defineEmits<SubmissionModalEmits>();

const handleApprove = () => {
  if (props.submission) {
    emit("approve", props.submission);
  }
};

const handleReject = () => {
  if (props.submission) {
    emit("reject", props.submission);
  }
};
</script>

<style scoped src="../style/admin-submission-modal.css"></style>
