<script setup lang="ts">
import { computed } from 'vue'
import type { Challenge } from '../types/challenge'

const props = defineProps<{ challenge: Challenge }>()
defineEmits<{
  (e: 'toggle', challenge: Challenge): void
  (e: 'delete', challenge: Challenge): void
  (e: 'edit', challenge: Challenge): void
}>()

// Ordnet jeder Kategorie die passenden Farben & Icons zu
const catStyles = computed(() => {
  switch (props.challenge.category) {
    case 'Fitness': return { icon: 'bi-bicycle', color: 'text-primary', bg: 'bg-primary-subtle', badge: 'text-primary' }
    case 'Lernen': return { icon: 'bi-book', color: 'text-success', bg: 'bg-success-subtle', badge: 'text-success' }
    case 'Gesundheit': return { icon: 'bi-heart', color: 'text-danger', bg: 'bg-danger-subtle', badge: 'text-danger' }
    case 'Alltag': return { icon: 'bi-house', color: 'text-warning', bg: 'bg-warning-subtle', badge: 'text-warning' }
    case 'Sozial': return { icon: 'bi-people', color: 'text-purple', bg: 'bg-purple-subtle', badge: 'text-purple' }
    default: return { icon: 'bi-star', color: 'text-secondary', bg: 'bg-secondary-subtle', badge: 'text-secondary' }
  }
})
</script>

<template>
  <div class="challenge-row" :class="{ 'is-done': challenge.done }">
    <div class="left-section">
      <div class="icon-circle" :class="catStyles.bg">
        <i class="bi fs-5" :class="[catStyles.icon, catStyles.color]"></i>
      </div>

      <div class="content">
        <div class="title" :class="{ 'text-muted text-decoration-line-through': challenge.done }">
          {{ challenge.title }}
        </div>
        <div class="subtitle text-muted small mt-1">
          Mach einen Schritt für deine Ziele in {{ challenge.category }}.
        </div>
      </div>
    </div>

    <div class="right-section">
      <span class="category-badge" :class="[catStyles.bg, catStyles.badge]">
        {{ challenge.category }}
      </span>

      <div class="actions ms-3">
        <button
          class="action-btn edit"
          data-bs-toggle="modal"
          data-bs-target="#editChallengeModal"
          @click="$emit('edit', challenge)"
          title="Bearbeiten"
        >
          <i class="bi bi-pencil"></i>
        </button>

        <button class="action-btn delete" @click="$emit('delete', challenge)" title="Löschen">
          <i class="bi bi-trash"></i>
        </button>

        <button
          class="action-btn complete"
          :class="{ 'is-active': challenge.done }"
          @click="$emit('toggle', challenge)"
          :title="challenge.done ? 'Wieder offen' : 'Erledigen'"
        >
          <i class="bi" :class="challenge.done ? 'bi-arrow-counterclockwise' : 'bi-check-lg'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  transition: background 0.2s;
}
.challenge-row:hover { background: #fdfdfd; }
.challenge-row.is-done { opacity: 0.85; }

.left-section, .right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.category-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
}

.actions { display: flex; gap: 8px; }

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #f3f4f6;
  background: white;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.action-btn:hover { background: #f3f4f6; color: #111; }
.action-btn.delete:hover { color: #ef4444; border-color: #ef4444; }
.action-btn.edit:hover { color: #3b82f6; border-color: #3b82f6; }
.action-btn.complete { color: #22c55e; border-color: #e6f4ea; }
.action-btn.complete.is-active { background: #e6f4ea; }
.action-btn.complete:hover { background: #22c55e; color: white; border-color: #22c55e; }

.bg-purple-subtle { background-color: #f3e8ff !important; }
.text-purple { color: #9333ea !important; }
</style>
