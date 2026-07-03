<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ChallengeCard from './ChallengeCard.vue'
import CategoryFilter from './CategoryFilter.vue'
import type { Challenge, ChallengeSuggestion } from '../types/challenge'
import { useStreak } from '../composables/useStreak'

// Dark Mode Logik
const darkMode = ref(false)
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark', darkMode.value)
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://dailyhabit.onrender.com').replace(/\/$/, '')
const CHALLENGES_API_URL = `${API_BASE_URL}/api/v1/challenges`
const { streak, refreshStreak } = useStreak()
const selectedCategory = ref('Alle')

const buildChallengesUrl = (category = selectedCategory.value) => {
  if (category === 'Alle') return CHALLENGES_API_URL
  return `${CHALLENGES_API_URL}?category=${encodeURIComponent(category)}`
}

const challenges = ref<Challenge[]>([])
const requestError = ref('')
const isLoadingChallenges = ref(false)

const loadChallenges = async (category = selectedCategory.value) => {
  requestError.value = ''
  isLoadingChallenges.value = true
  try {
    const response = await fetch(buildChallengesUrl(category))
    if (!response.ok) throw new Error('Challenges konnten nicht geladen werden.')
    challenges.value = await response.json()
  } catch {
    requestError.value = 'Die Challenges konnten nicht geladen werden. Bitte versuche es erneut.'
  } finally {
    isLoadingChallenges.value = false
  }
}

onMounted(() => {
  loadChallenges()
  refreshStreak()
})

const generatedChallenge = ref<ChallengeSuggestion | null>(null)
const suggestionSuccess = ref('')
const isLoadingSuggestion = ref(false)
const isSavingSuggestion = ref(false)

const selectCategory = async (category: string) => {
  selectedCategory.value = category
  await loadChallenges(category)
}

const completedCount = computed(() => challenges.value.filter(c => c.done).length)
const totalCount = computed(() => challenges.value.length)
const progress = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const toggleDone = async (challenge: Challenge) => {
  requestError.value = ''
  const local = challenges.value.find(c => c.id === challenge.id)
  if (local) local.done = !local.done

  try {
    const response = await fetch(`${CHALLENGES_API_URL}/${challenge.id}/toggle`, { method: 'PATCH' })
    if (!response.ok) {
      if (local) local.done = !local.done
      throw new Error('Challenge konnte nicht aktualisiert werden.')
    }
    void refreshStreak()
  } catch {
    requestError.value = 'Die Challenge konnte nicht aktualisiert werden.'
  }
}

const pickRandom = async () => {
  requestError.value = ''
  suggestionSuccess.value = ''
  try {
    isLoadingSuggestion.value = true
    const response = await fetch(`${CHALLENGES_API_URL}/suggestions/random`)
    if (!response.ok) throw new Error('Zufällige Challenge konnte nicht geladen werden.')
    generatedChallenge.value = await response.json()
  } catch {
    requestError.value = 'Die zufällige Challenge konnte nicht geladen werden.'
  } finally {
    isLoadingSuggestion.value = false
  }
}

const acceptGeneratedChallenge = async () => {
  requestError.value = ''
  suggestionSuccess.value = ''
  if (!generatedChallenge.value) return

  try {
    isSavingSuggestion.value = true
    const response = await fetch(CHALLENGES_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generatedChallenge.value),
    })
    if (!response.ok) throw new Error('Challenge konnte nicht gespeichert werden.')

    await loadChallenges()
    generatedChallenge.value = null
    suggestionSuccess.value = 'Challenge wurde übernommen.'
  } catch {
    requestError.value = 'Die Challenge konnte nicht übernommen werden.'
  } finally {
    isSavingSuggestion.value = false
  }
}

const deleteChallenge = async (challenge: Challenge) => {
  if (!confirm(`Möchtest du die Aufgabe "${challenge.title}" wirklich löschen?`)) return;
  requestError.value = ''
  try {
    const response = await fetch(`${CHALLENGES_API_URL}/${challenge.id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Challenge konnte nicht gelöscht werden.')
    await loadChallenges()
  } catch {
    requestError.value = 'Die Challenge konnte nicht gelöscht werden.'
  }
}

const newTitle = ref('')
const newCategory = ref('Alltag')
const addChallengeError = ref('')
const isSavingChallenge = ref(false)
const closeAddModalButton = ref<HTMLButtonElement | null>(null)

const addChallenge = async () => {
  addChallengeError.value = ''
  if (newTitle.value.trim() === '') return

  try {
    isSavingChallenge.value = true
    const response = await fetch(CHALLENGES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTitle.value.trim(),
        category: newCategory.value,
        done: false,
      }),
    })

    if (!response.ok) throw new Error('Challenge konnte nicht gespeichert werden.')

    await loadChallenges()
    newTitle.value = ''
    newCategory.value = 'Alltag'
    closeAddModalButton.value?.click()
  } catch {
    addChallengeError.value = 'Die Challenge konnte nicht gespeichert werden. Bitte versuche es erneut.'
  } finally {
    isSavingChallenge.value = false
  }
}

const editingChallengeId = ref<number | null>(null)
const editTitle = ref('')
const editCategory = ref('Alltag')
const editChallengeError = ref('')
const isSavingEdit = ref(false)
const closeEditModalButton = ref<HTMLButtonElement | null>(null)

const openEditModal = (challenge: Challenge) => {
  editingChallengeId.value = challenge.id
  editTitle.value = challenge.title
  editCategory.value = challenge.category
  editChallengeError.value = ''
}

const saveEditChallenge = async () => {
  editChallengeError.value = ''
  if (!editingChallengeId.value || editTitle.value.trim() === '') return

  try {
    isSavingEdit.value = true
    const response = await fetch(`${CHALLENGES_API_URL}/${editingChallengeId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: editTitle.value.trim(),
        category: editCategory.value,
        done: challenges.value.find(c => c.id === editingChallengeId.value)?.done || false,
      }),
    })

    if (!response.ok) throw new Error('Challenge konnte nicht aktualisiert werden.')

    await loadChallenges()
    closeEditModalButton.value?.click()
  } catch {
    editChallengeError.value = 'Die Challenge konnte nicht aktualisiert werden. Bitte versuche es erneut.'
  } finally {
    isSavingEdit.value = false
  }
}
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="fw-bold mb-1">
          <i class="bi bi-stars text-primary me-2"></i>Deine täglichen Challenges
        </h2>
        <p class="text-muted mb-0">Bleib dran und erreiche deine Ziele!</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary rounded-pill px-4 fw-medium shadow-sm" data-bs-toggle="modal" data-bs-target="#addChallengeModal">
          <i class="bi bi-plus-lg me-1"></i> Neue Challenge
        </button>
        <button class="btn btn-white rounded-pill px-4 fw-medium border shadow-sm" @click="pickRandom" :disabled="isLoadingSuggestion">
          <i class="bi bi-dice-5 me-1"></i> {{ isLoadingSuggestion ? 'Generiere...' : 'Zufällige Challenge' }}
        </button>

        <button
          class="btn btn-white rounded-circle border shadow-sm d-flex align-items-center justify-content-center"
          @click="toggleDarkMode"
          style="width: 42px; height: 42px;"
          title="Dark Mode umschalten"
        >
          <i class="bi fs-5" :class="darkMode ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-secondary'"></i>
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card streak-card">
          <div class="icon-box bg-success-subtle text-success">
            <i class="bi bi-fire fs-4"></i>
          </div>
          <div>
            <div class="text-muted small fw-medium">Aktuelle Streak</div>
            <div class="fs-4 fw-bold text-success">{{ streak }} Tage</div>
            <div class="small text-muted">Weiter so! 🔥</div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="stat-card">
          <div class="icon-box bg-primary-subtle text-primary">
            <i class="bi bi-graph-up-arrow fs-4"></i>
          </div>
          <div class="flex-grow-1">
            <div class="text-muted small fw-medium">Dein Fortschritt</div>
            <div class="fs-4 fw-bold text-primary">{{ progress }}%</div>
            <div class="progress mt-2" style="height: 6px;">
              <div class="progress-bar bg-primary" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="stat-card">
          <div class="icon-box bg-purple-subtle text-purple">
            <i class="bi bi-star fs-4"></i>
          </div>
          <div>
            <div class="text-muted small fw-medium">Erledigte Challenges</div>
            <div class="fs-4 fw-bold text-purple">{{ completedCount }} / {{ totalCount }}</div>
            <div class="small text-muted">Diese Woche</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="requestError" class="alert alert-danger rounded-4">{{ requestError }}</div>
    <div v-if="suggestionSuccess" class="alert alert-success rounded-4">{{ suggestionSuccess }}</div>
    <div v-if="generatedChallenge" class="alert alert-warning rounded-4 d-flex align-items-center gap-3">
      <div class="flex-grow-1">
        <strong>{{ generatedChallenge.title }}</strong> ({{ generatedChallenge.category }})
      </div>
      <div class="d-flex align-items-center gap-3 flex-shrink-0">
        <button class="btn btn-success btn-sm rounded-pill px-3" @click="acceptGeneratedChallenge">Übernehmen</button>
        <button class="btn-close m-0" @click="generatedChallenge = null"></button>
      </div>
    </div>

    <CategoryFilter :selected="selectedCategory" @update:selected="selectCategory" />

    <div class="challenges-container mt-2">
      <div v-if="isLoadingChallenges && challenges.length === 0" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="!isLoadingChallenges && challenges.length === 0" class="text-center py-5 text-muted">
        <i class="bi bi-inbox fs-1 d-block mb-3"></i>
        <h5>Keine Challenges gefunden</h5>
        <p>Leg eine neue an oder generiere einen Vorschlag.</p>
      </div>

      <div v-else class="list-wrapper">
        <ChallengeCard
          v-for="challenge in challenges"
          :key="challenge.id"
          :challenge="challenge"
          @toggle="toggleDone"
          @delete="deleteChallenge"
          @edit="openEditModal"
        />
      </div>
    </div>
  </div>

  <div class="modal fade" id="addChallengeModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title fw-bold">Neue Challenge</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" ref="closeAddModalButton"></button>
        </div>
        <div class="modal-body pt-0">
          <div v-if="addChallengeError" class="alert alert-danger">{{ addChallengeError }}</div>
          <div class="mb-3">
            <label class="form-label text-muted small fw-medium">Titel</label>
            <input v-model="newTitle" type="text" class="form-control" placeholder="z. B. 10.000 Schritte gehen" />
          </div>
          <div class="mb-3">
            <label class="form-label text-muted small fw-medium">Kategorie</label>
            <select v-model="newCategory" class="form-select">
              <option>Fitness</option>
              <option>Lernen</option>
              <option>Gesundheit</option>
              <option>Alltag</option>
              <option>Sozial</option>
            </select>
          </div>
        </div>
        <div class="modal-footer border-top-0">
          <button class="btn btn-primary rounded-pill w-100" @click="addChallenge" :disabled="isSavingChallenge">
            Speichern
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="editChallengeModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content rounded-4 border-0 shadow">
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title fw-bold">Challenge bearbeiten</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" ref="closeEditModalButton"></button>
        </div>
        <div class="modal-body pt-0">
          <div v-if="editChallengeError" class="alert alert-danger">{{ editChallengeError }}</div>
          <div class="mb-3">
            <label class="form-label text-muted small fw-medium">Titel</label>
            <input v-model="editTitle" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label text-muted small fw-medium">Kategorie</label>
            <select v-model="editCategory" class="form-select">
              <option>Fitness</option>
              <option>Lernen</option>
              <option>Gesundheit</option>
              <option>Alltag</option>
              <option>Sozial</option>
            </select>
          </div>
        </div>
        <div class="modal-footer border-top-0">
          <button class="btn btn-primary rounded-pill w-100" @click="saveEditChallenge" :disabled="isSavingEdit">
            Änderungen speichern
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-white {
  background-color: #fff;
  color: #374151;
}
.btn-white:hover {
  background-color: #f9fafb;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  height: 100%;
}

.streak-card {
  background: #f8faf9;
  border-color: #e6f4ea;
}

.icon-box {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-purple-subtle { background-color: #f3e8ff; }
.text-purple { color: #9333ea; }

.challenges-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.list-wrapper > :deep(div):not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}
</style>
