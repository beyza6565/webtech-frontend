<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

onMounted(() => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark')
  }
})
</script>

<template>
  <main class="app-container">
    <RouterView />
  </main>
</template>

<style>
/* STANDARD (HELL) */
body {
  background-color: #f9fafb;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* --- DARK MODE --- */
body.dark {
  background-color: #0f172a;
  color: #e5e7eb;
}

/* Hier machen wir die weißen Karten und Container dunkel */
body.dark .panel,
body.dark .stat-card,
body.dark .challenges-container,
body.dark .challenge-row,
body.dark .modal-content,
body.dark .btn-white {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}

body.dark .title,
body.dark h2,
body.dark h5 {
  color: white !important;
}

body.dark .text-muted,
body.dark .subtitle {
  color: #94a3b8 !important;
}

body.dark .action-btn,
body.dark .filter-btn {
  background-color: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

body.dark .action-btn:hover,
body.dark .filter-btn:hover {
  background-color: #334155;
  color: white;
}

/* Die dunkle Modal-Kopfzeile anpassen */
body.dark .modal-header,
body.dark .modal-footer {
  border-color: #334155 !important;
}
body.dark .form-control,
body.dark .form-select {
  background-color: #0f172a;
  border-color: #334155;
  color: white;
}
</style>
