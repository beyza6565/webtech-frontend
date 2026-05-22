<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">
        <i class="bi bi-rocket-takeoff-fill text-primary me-2"></i>Daily Habits
      </a>
      <span class="badge bg-warning text-dark fs-6 rounded-pill px-3 py-2 shadow-sm">
        <i class="bi bi-fire text-danger me-1"></i>3 Tage Streak
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
