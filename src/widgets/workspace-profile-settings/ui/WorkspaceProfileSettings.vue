<template>
  <div class="workspace-settings">
    <div class="workspace-settings__header">
      <Button
        label="Назад"
        icon="pi pi-arrow-left"
        text
        severity="secondary"
        @click="goBack"
      />
    </div>
    <Card class="settings-card">
      <template #title>Профиль</template>
      <template #content>
        <form class="settings-form" @submit.prevent="saveProfile">
          <div class="form-grid">
            <div class="form-field">
              <label for="firstName">Имя</label>
              <InputText
                id="firstName"
                v-model="form.firstName"
                placeholder="Ваше имя"
              />
            </div>
            <div class="form-field">
              <label for="lastName">Фамилия</label>
              <InputText
                id="lastName"
                v-model="form.lastName"
                placeholder="Ваша фамилия"
              />
            </div>
            <div class="form-field">
              <label for="email">Email</label>
              <InputText id="email" v-model="form.email" disabled />
            </div>
            <div class="form-field">
              <label for="position">Должность / роль</label>
              <InputText
                id="position"
                v-model="form.position"
                placeholder="Например, Frontend developer"
              />
            </div>
          </div>

          <div class="form-field">
            <label for="bio">О себе</label>
            <Textarea
              id="bio"
              v-model="form.bio"
              auto-resize
              rows="4"
              placeholder="Расскажите о своем опыте, интересах и целях."
            />
          </div>

          <div class="preferences">
            <h3>Предпочтения</h3>
            <div class="preferences-grid">
              <div class="preference-card">
                <div>
                  <h4>Уведомления</h4>
                  <p>Получать уведомления о новых тестах и вопросах.</p>
                </div>
                <InputSwitch v-model="form.notifications" />
              </div>
              <div class="preference-card">
                <div>
                  <h4>Темная тема</h4>
                  <p>Включить темный режим интерфейса (скоро).</p>
                </div>
                <InputSwitch v-model="form.darkTheme" disabled />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <Button
              label="Сохранить изменения"
              icon="pi pi-save"
              :loading="saving"
            />
            <Button
              type="button"
              label="Отменить"
              icon="pi pi-refresh"
              text
              @click="resetForm"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useToastClient } from "@shared/hooks/useToastClient";

const { user } = useUserSession();
const toast = useToastClient();

const saving = ref(false);

const initialData = computed(() => {
  const current = user.value || {};
  return {
    firstName: current.firstName || "",
    lastName: current.lastName || "",
    email: current.email || "",
    position: "",
    bio: "",
    notifications: true,
    darkTheme: false,
  };
});

const form = reactive({ ...initialData.value });

watch(
  initialData,
  (value) => {
    Object.assign(form, value);
  },
  { immediate: true }
);

const saveProfile = async () => {
  saving.value = true;
  try {
    await $fetch("/api/profile", {
      method: "POST",
      body: form,
    });
    toast.add({
      severity: "success",
      summary: "Профиль обновлен",
      detail: "Данные успешно сохранены.",
    });
  } catch (err) {
    console.error("Failed to save profile", err);
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось сохранить профиль. Попробуйте позже.",
    });
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, initialData.value);
};

const goBack = () => {
  navigateTo("/workspace/profile");
};
</script>

<style scoped src="../style/workspace-profile-settings.css"></style>

