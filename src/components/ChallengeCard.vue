<script setup lang="ts">
import type { Challenge } from '../types/challenge'

defineProps<{ challenge: Challenge }>()

defineEmits<{
  (e: 'toggle', challenge: Challenge): void
  (e: 'delete', challenge: Challenge): void
  (e: 'edit', challenge: Challenge): void
}>()
</script>

<template>
  <div
    class="challenge-card"
    :class="{ 'is-done': challenge.done }"
  >
    <div class="left">
      <div class="icon">
        <i class="bi bi-star"></i>
      </div>

      <div class="content">
        <div class="title" :class="{ done: challenge.done }">
          {{ challenge.title }}
        </div>

        <div class="meta">
          <span class="badge">{{ challenge.category }}</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button
        class="icon-btn edit"
        data-bs-toggle="modal"
        data-bs-target="#editChallengeModal"
        @click="$emit('edit', challenge)"
        title="Bearbeiten"
      >
        <i class="bi bi-pencil-fill"></i>
      </button>

      <button
        class="icon-btn delete"
        @click="$emit('delete', challenge)"
        title="Löschen"
      >
        <i class="bi bi-trash-fill"></i>
      </button>

      <button
        class="icon-btn toggle"
        @click="$emit('toggle', challenge)"
        :title="challenge.done ? 'Wieder offen' : 'Erledigt'"
      >
        <i class="bi" :class="challenge.done ? 'bi-arrow-counterclockwise' : 'bi-check-lg'"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.challenge-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 16px;
  border-radius: 14px;

  background: #ffffff;
  border: 1px solid #eaeaea;

  transition: all 0.2s ease;
}

.challenge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f4f6ff;
  color: #4f46e5;
}

.content {
  min-width: 0;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.title.done {
  text-decoration: line-through;
  color: #9ca3af;
}

.meta {
  margin-top: 4px;
}

.badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
}

.actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 34px;
  height: 34px;

  border: none;
  border-radius: 10px;

  background: transparent;
  color: #555;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: 0.2s;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.icon-btn.delete:hover {
  color: #ef4444;
}

.icon-btn.edit:hover {
  color: #3b82f6;
}

.icon-btn.toggle:hover {
  color: #22c55e;
}

.is-done {
  background: #fafafa;
  border-color: #eee;
}
</style>
