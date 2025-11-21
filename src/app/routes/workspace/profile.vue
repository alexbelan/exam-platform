<template>
  <div class="profile-page">
    <Card class="profile-card">
      <template #content>
        <div class="development-message">
          <i class="pi pi-cog development-icon" />
          <h2>Страница в разработке</h2>
          <p>Эта страница находится в разработке и скоро будет доступна.</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";

definePageMeta({
  layout: "workspace",
  middleware: "workspace",
  ssr: false,
});

// SEO Meta tags
useSeoMeta({
  title: "Профиль",
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 600px;
}

.development-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.development-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.development-message h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.75rem;
}

.development-message p {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}
</style>

