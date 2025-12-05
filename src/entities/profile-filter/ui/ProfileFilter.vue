<template>
  <Card class="profile-filter">
    <template #title>
      <h3 class="profile-filter__title">Фильтр</h3>
    </template>

    <template #content>
      <div class="profile-filter__list">
        <button
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          :class="[
            'profile-filter__item',
            { 'profile-filter__item--active': modelValue === filter.key },
          ]"
          @click="selectFilter(filter.key)"
        >
          <i :class="['pi', filter.icon, 'profile-filter__icon']" />
          <span class="profile-filter__label">{{ filter.label }}</span>
        </button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import type { ProfileContentFilter } from "@entities/profile-state";
import { useProfileFilter } from "../model/useProfileFilter";

const modelValue = defineModel<ProfileContentFilter>({
  default: "favorite-questions",
});

const { filters, selectFilter } = useProfileFilter(modelValue);
</script>

<style scoped src="../style/profile-filter.css"></style>
