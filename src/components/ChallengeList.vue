<script setup lang="ts">
import { ref } from 'vue'

const challenges = ref([
  { id: 1, title: '10.000 Schritte gehen', category: 'Fitness', done: true },
  { id: 2, title: '30 Min. lesen', category: 'Lernen', done: false },
  { id: 3, title: 'Viel Wasser trinken', category: 'Achtsamkeit', done: false },
  { id: 4, title: 'Test', category: 'Achtsamkeit', done: false },
])

// Ein kleiner Trick, um den Fortschrittsbalken zu berechnen
const progress = 33; // Beispielwert (1 von 3 erledigt)
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">

        <div class="mb-4">
          <label class="form-label fw-bold">Tagesfortschritt: {{ progress }}%</label>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-success" role="progressbar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <h2 class="mb-3">Heutige Aufgaben</h2>

        <div v-for="challenge in challenges" :key="challenge.id" class="card mb-3 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">{{ challenge.title }}</h5>
              <span class="badge bg-info text-dark">{{ challenge.category }}</span>
            </div>

            <button :class="['btn', challenge.done ? 'btn-success' : 'btn-outline-primary']">
              {{ challenge.done ? 'Erledigt ✓' : 'Abhaken' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
