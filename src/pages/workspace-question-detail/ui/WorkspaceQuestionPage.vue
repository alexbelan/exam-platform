<template>
  <WorkspaceQuestionDetail :question-id="questionId" />
</template>

<script setup lang="ts">
import { WorkspaceQuestionDetail } from "@widgets/workspace-question-detail";

const route = useRoute();
const questionId = computed(() => Number(route.params.id));
</script>

