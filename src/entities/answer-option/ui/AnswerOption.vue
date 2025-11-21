<template>
  <div class="answer-option">
    <label class="answer-option__label">
      <input
        :type="type"
        :name="name"
        :value="answer.id"
        :checked="isSelected"
        @change="handleChange"
        class="answer-option__input"
      />
      <span class="answer-option__text">{{ answer.text }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { AnswerOptionProps } from "../model/types";

const props = defineProps<AnswerOptionProps>();

const emit = defineEmits<{
  (e: "change", answerId: number, event: Event): void;
}>();

const handleChange = (event: Event) => {
  emit("change", props.answer.id, event);
};
</script>

<style scoped src="../style/answer-option.css"></style>
