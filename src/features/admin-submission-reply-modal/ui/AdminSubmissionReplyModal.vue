<template>
  <Dialog
    :visible="props.visible"
    @update:visible="$emit('update:visible', $event)"
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
      <Button label="Отмена" severity="secondary" @click="handleCancel" />
      <Button label="Отправить ответ" @click="handleSend" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
import type {
  AdminSubmissionReplyModalProps,
  AdminSubmissionReplyModalEmits,
} from "../model/types";

const props = defineProps<AdminSubmissionReplyModalProps>();
const emit = defineEmits<AdminSubmissionReplyModalEmits>();

const replyText = ref("");
const sendEmail = ref(true);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      replyText.value = "";
      sendEmail.value = true;
    }
  }
);

const handleCancel = () => {
  emit("update:visible", false);
};

const handleSend = () => {
  if (props.submission && replyText.value) {
    emit("send", {
      submission: props.submission,
      reply: replyText.value,
      sendEmail: sendEmail.value,
    });
    emit("update:visible", false);
  }
};
</script>

<style scoped src="../style/admin-submission-reply-modal.css"></style>
