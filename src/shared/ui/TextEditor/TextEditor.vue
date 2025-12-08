<template>
  <div class="text-editor-wrapper">
    <label v-if="props.label" class="form-label">
      {{ props.label }}
      <span v-if="props.required" class="required">*</span>
    </label>
    <Editor
      :model-value="props.modelValue"
      :editor-style="props.editorStyle"
      class="text-editor"
      :modules="editorModules"
      @update:model-value="handleUpdate"
    >
      <template #toolbar>
        <span class="ql-formats">
          <select class="ql-header" title="Заголовок">
            <option value="">Обычный текст</option>
            <option value="2">Заголовок 2</option>
            <option value="3">Заголовок 3</option>
          </select>
        </span>
        <span class="ql-formats">
          <button class="ql-bold" title="Жирный" />
          <button class="ql-italic" title="Курсив" />
          <button class="ql-underline" title="Подчеркнутый" />
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered" title="Нумерованный список" />
          <button class="ql-list" value="bullet" title="Маркированный список" />
          <button class="ql-indent" value="-1" title="Уменьшить отступ" />
          <button class="ql-indent" value="+1" title="Увеличить отступ" />
        </span>
        <span class="ql-formats">
          <button class="ql-blockquote" title="Цитата" />
          <button class="ql-link" title="Ссылка" />
        </span>
        <span class="ql-formats">
          <button class="ql-code-block" title="Блок кода" />
          <button class="ql-code" title="Инлайн код" />
        </span>
      </template>
    </Editor>
    <small v-if="props.hint" class="editor-hint">{{ props.hint }}</small>
  </div>
</template>

<script setup lang="ts">
import Editor from "primevue/editor";
import hljs from "highlight.js";
import type { HLJSApi } from "highlight.js";

// Расширяем интерфейс Window для добавления свойства hljs
declare global {
  interface Window {
    hljs?: HLJSApi;
  }
}

interface Props {
  modelValue: string;
  editorStyle?: string;
  hint?: string;
  label?: string;
  required?: boolean;
}

if (import.meta.client) {
  window.hljs = hljs;
}

const props = withDefaults(defineProps<Props>(), {
  editorStyle: "height: 400px",
  hint: "Используйте панель инструментов для форматирования текста",
  label: "",
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// Настройка модулей редактора с подсветкой синтаксиса

const editorModules = {
  syntax: {
    hljs,
  },
};

const handleUpdate = (value: string) => {
  emit("update:modelValue", value);
};
</script>

<style scoped>
.text-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
}

.text-editor {
  width: 100%;
}

.editor-hint {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Улучшение стилей toolbar */
.text-editor :deep(.ql-toolbar) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  padding: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.text-editor :deep(.ql-toolbar .ql-formats) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.5rem;
  padding-right: 0.5rem;
  border-right: 1px solid #e9ecef;
}

.text-editor :deep(.ql-toolbar .ql-formats:last-child) {
  border-right: none;
  margin-right: 0;
  padding-right: 0;
}

.text-editor :deep(.ql-toolbar button),
.text-editor :deep(.ql-toolbar select) {
  height: 32px;
  min-width: 32px;
  border-radius: 4px;
  border: 1px solid transparent;
  background-color: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-editor :deep(.ql-toolbar button:hover),
.text-editor :deep(.ql-toolbar select:hover) {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.text-editor :deep(.ql-toolbar button.ql-active) {
  background-color: #dee2e6;
  border-color: #ced4da;
}

.text-editor :deep(.ql-toolbar select) {
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  min-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ширина для select заголовка - одна строка */
.text-editor :deep(.ql-toolbar .ql-header) {
  min-width: 160px;
  width: auto;
}

.text-editor :deep(.ql-toolbar .ql-stroke) {
  stroke: #495057;
}

.text-editor :deep(.ql-toolbar .ql-fill) {
  fill: #495057;
}

/* Увеличение размера иконки цитаты */
.text-editor :deep(.ql-toolbar .ql-blockquote svg),
.text-editor :deep(.ql-toolbar .ql-blockquote) {
  width: 20px;
  height: 20px;
}

.text-editor :deep(.ql-toolbar .ql-blockquote .ql-stroke) {
  stroke-width: 1.5;
}

.text-editor :deep(.ql-toolbar .ql-blockquote .ql-fill) {
  fill-rule: evenodd;
}

.text-editor :deep(.ql-container) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  font-family: inherit;
}

/* Стили для блока кода в редакторе с темой atom-one-dark */
.text-editor :deep(.ql-code-block-container) {
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 6px;
  padding: 1rem;
  margin: 0.75rem 0;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  border: 1px solid #3a3f4b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-editor :deep(.ql-code-block) {
  background-color: transparent;
  color: inherit;
  padding: 0;
  margin: 0;
  border: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Стили для подсветки синтаксиса внутри блока кода */
.text-editor :deep(.ql-code-block .hljs) {
  background: transparent !important;
  padding: 0 !important;
  display: block;
  overflow-x: auto;
}

/* Сохраняем цвета из темы atom-one-dark */
.text-editor :deep(.ql-code-block .hljs-keyword),
.text-editor :deep(.ql-code-block .hljs-selector-tag),
.text-editor :deep(.ql-code-block .hljs-literal) {
  color: #c678dd;
}

.text-editor :deep(.ql-code-block .hljs-string),
.text-editor :deep(.ql-code-block .hljs-doctag) {
  color: #98c379;
}

.text-editor :deep(.ql-code-block .hljs-title),
.text-editor :deep(.ql-code-block .hljs-section),
.text-editor :deep(.ql-code-block .hljs-type) {
  color: #e5c07b;
}

.text-editor :deep(.ql-code-block .hljs-attribute),
.text-editor :deep(.ql-code-block .hljs-name),
.text-editor :deep(.ql-code-block .hljs-variable) {
  color: #d19a66;
}

.text-editor :deep(.ql-code-block .hljs-number) {
  color: #d19a66;
}

.text-editor :deep(.ql-code-block .hljs-comment) {
  color: #5c6370;
  font-style: italic;
}

.text-editor :deep(.ql-code-block .hljs-function) {
  color: #61afef;
}

.text-editor :deep(.ql-code-block .hljs-built_in),
.text-editor :deep(.ql-code-block .hljs-builtin-name) {
  color: #56b6c2;
}

.text-editor :deep(.ql-code-block .hljs-meta) {
  color: #abb2bf;
}

.text-editor :deep(.ql-code-block .hljs-params) {
  color: #abb2bf;
}

/* Стили для инлайн кода */
.text-editor :deep(.ql-code) {
  background-color: #f4f4f4;
  color: #d63384;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 0.9em;
}

/* Улучшение отображения цитат */
.text-editor :deep(.ql-blockquote) {
  border-left: 4px solid #dee2e6;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6c757d;
  font-style: italic;
}

/* Улучшение отображения заголовков */
.text-editor :deep(.ql-editor h2) {
  font-size: 1.75rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.text-editor :deep(.ql-editor h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

/* Улучшение отображения списков */
.text-editor :deep(.ql-editor ul),
.text-editor :deep(.ql-editor ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.text-editor :deep(.ql-editor li) {
  margin: 0.25rem 0;
}
</style>
