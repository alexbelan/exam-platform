<template>
  <AdminQuestionEditor
    :question-id="questionId"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { AdminQuestionEditor } from "@widgets/admin-question-editor";
import { useAdminQuestionPage } from "../model/useAdminQuestionPage";

const route = useRoute();
const questionId = computed(() => route.params.id as string);

const { handleSave, handleCancel } = useAdminQuestionPage(questionId.value);
</script>

