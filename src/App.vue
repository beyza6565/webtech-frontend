<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useStreak } from './composables/useStreak'

const { streak, completedToday, isLoadingStreak, refreshStreak } = useStreak()

onMounted(refreshStreak)
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">
        <i class="bi bi-rocket-takeoff-fill text-primary me-2"></i>Daily Habits
      </a>

      <span
        v-if="isLoadingStreak"
        class="badge bg-secondary text-white fs-6 rounded-pill px-3 py-2 shadow-sm"
        title="Streak wird geladen…"
      >
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Streak…
      </span>
      <span
        v-else-if="streak === 0"
        class="badge bg-secondary text-white fs-6 rounded-pill px-3 py-2 shadow-sm"
        title="Noch keine Aktivität aufgezeichnet"
      >
        <i class="bi bi-fire me-1"></i>Noch keine Streak
      </span>
      <span
        v-else
        class="badge fs-6 rounded-pill px-3 py-2 shadow-sm"
        :class="completedToday ? 'bg-warning text-dark' : 'bg-secondary text-white'"
        :title="completedToday ? 'Heute bereits aktiv – Streak läuft!' : 'Heute noch keine Challenge erledigt – Streak in Gefahr'"
      >
        <i class="bi bi-fire me-1" :class="{ 'text-danger': completedToday }"></i>
        {{ streak }} {{ streak === 1 ? 'Tag' : 'Tage' }} Streak
      </span>
    </div>
  </nav>

  <RouterView />
</template>

<style>
body {
  background-color: #f0f4f8;
}
.btn {
  transition: all 0.3s ease;
}
</style>
