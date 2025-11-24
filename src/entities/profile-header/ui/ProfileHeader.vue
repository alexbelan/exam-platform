<template>
  <Card class="profile-header">
    <template #content>
      <div class="profile-header__content">
        <!-- Левая часть: информация о пользователе -->
        <div class="profile-header__info">
          <!-- Аватар, имя и настройки -->
          <div class="profile-header__user-row">
            <div class="profile-header__user">
              <Avatar
                :label="userInitials"
                :image="user.avatar"
                shape="circle"
                size="large"
                class="profile-header__avatar"
              />
              <div class="profile-header__user-info">
                <h2 class="profile-header__name">{{ displayName }}</h2>
              </div>
            </div>
            <!-- Кнопка настроек -->
            <div class="profile-header__actions">
              <Button
                label="Настройки"
                icon="pi pi-cog"
                severity="secondary"
                outlined
                @click="goToSettings"
              />
            </div>
          </div>

          <!-- Статистика -->
          <div class="profile-header__stats">
            <template v-if="loading && !statistics">
              <Skeleton
                v-for="i in 3"
                :key="i"
                class="profile-header__stat-skeleton"
              />
            </template>
            <template v-else>
              <div class="profile-header__stat-card">
                <div
                  class="profile-header__stat-value profile-header__stat-value--primary"
                >
                  {{ statistics?.totalTestsCompleted ?? 0 }}
                </div>
                <div class="profile-header__stat-label">Тестов пройдено</div>
              </div>
              <div class="profile-header__stat-card">
                <div
                  class="profile-header__stat-value"
                  :class="
                    getProblematicQuestionsColorClass(
                      statistics?.problematicQuestionsCount ?? 0
                    )
                  "
                >
                  {{ statistics?.problematicQuestionsCount ?? 0 }}
                </div>
                <div class="profile-header__stat-label">
                  Проблемных вопросов
                </div>
              </div>
              <div class="profile-header__stat-card">
                <div
                  class="profile-header__stat-value"
                  :class="
                    getAverageScoreColorClass(statistics?.averageScore ?? 0)
                  "
                >
                  {{ Math.round(statistics?.averageScore ?? 0) }}%
                </div>
                <div class="profile-header__stat-label">Средний процент</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import type { ProfileHeaderProps } from "../model/types";

const props = withDefaults(defineProps<ProfileHeaderProps>(), {
  loading: false,
});

// Полное имя пользователя
const displayName = computed(() => {
  const { firstName, lastName, email } = props.user;
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return name || email || "Пользователь";
});

// Инициалы для аватара
const userInitials = computed(() => {
  const { firstName, lastName, email } = props.user;
  if (firstName && lastName) {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  }
  if (firstName) {
    return (firstName[0] || "U").toUpperCase();
  }
  return email?.[0]?.toUpperCase() || "U";
});

// Переход в настройки
const goToSettings = () => {
  navigateTo("/workspace/profile/settings");
};

// Определение цвета для среднего процента
const getAverageScoreColorClass = (score: number): string => {
  if (score === 0) {
    return "profile-header__stat-value--primary";
  }
  if (score < 50) {
    return "profile-header__stat-value--danger";
  }
  if (score < 80) {
    return "profile-header__stat-value--warning";
  }
  return "profile-header__stat-value--success";
};

// Определение цвета для проблемных вопросов
const getProblematicQuestionsColorClass = (count: number): string => {
  if (count === 0) {
    return "profile-header__stat-value--primary";
  }
  if (count <= 10) {
    return "profile-header__stat-value--warning";
  }
  return "profile-header__stat-value--danger";
};
</script>

<style scoped src="../style/profile-header.css"></style>
