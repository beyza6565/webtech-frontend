<script setup lang="ts">
interface Challenge {
  id: number
  title: string
  category: string
  done: boolean
  icon?: string
}

defineProps<{ challenge: Challenge }>()

// HIER NEU: Wir haben 'delete' und 'edit' zu den Emits hinzugefügt
defineEmits<{
  (e: 'toggle', challenge: Challenge): void
  (e: 'delete', challenge: Challenge): void
  (e: 'edit', challenge: Challenge): void
}>()
</script>

<template>
  <div
    class="card shadow-sm border-0 rounded-4"
    :class="{ 'opacity-75 bg-light': challenge.done }"
  >
    <div class="card-body d-flex align-items-center justify-content-between p-3">

      <div class="d-flex align-items-center gap-3">
        <div
          class="rounded-circle d-flex align-items-center justify-content-center"
          style="width: 50px; height: 50px;"
          :class="challenge.done ? 'bg-success text-white' : 'bg-primary text-white bg-opacity-75'"
        >
          <i class="bi fs-4" :class="challenge.icon ?? 'bi-star'"></i>
        </div>

        <div>
          <h5
            class="card-title mb-1 fw-bold"
            :class="{ 'text-decoration-line-through text-muted': challenge.done }"
          >
            {{ challenge.title }}
          </h5>
          <span class="badge bg-secondary rounded-pill">{{ challenge.category }}</span>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">

        <button
          class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
          style="width: 40px; height: 40px;"
          @click="$emit('edit', challenge)"
