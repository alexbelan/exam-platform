<template>
  <div class="profile-page">
    <!-- Хедер профиля -->
    <ProfileHeader
      :user="userData"
      :statistics="statisticsValue"
      :loading="statisticsPendingValue"
    />

    <div class="profile-page__content">
      <!-- Контент с карточками -->
      <WorkspaceProfileDisplay class="profile-page__content-area" />

      <!-- Боковой фильтр -->
      <ProfileFilter v-model="activeFilter" class="profile-page__filter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProfileHeader } from "@entities/profile-header";
import { ProfileFilter } from "@entities/profile-filter";
import { WorkspaceProfileDisplay } from "@widgets/workspace-profile-display";
import { useProfilePage } from "../model/useProfilePage";

const { userData, activeFilter, statisticsValue, statisticsPendingValue } =
  useProfilePage();
</script>

<style scoped src="../style/profile-page.css"></style>
