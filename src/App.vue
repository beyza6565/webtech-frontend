<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-container">
    <RouterView />
  </main>
</template>

<style>
body {
  background-color: #f9fafb; /* Sanftes Grau für den perfekten Kontrast */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.app-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}
</style>
