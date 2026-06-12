<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ChallengeCard from './ChallengeCard.vue'
import CategoryFilter from './CategoryFilter.vue'

interface Challenge {
  id: number
  title: string
  category: string
  done: boolean
}

interface ChallengeSuggestion {
  title: string
  category: string
  done: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dailyhabit.onrender.com'
const CHALLENGES_API_URL = `${API_BASE_URL}/api/v1/challenges`
const selectedCategory = ref('Alle')

const buildChallengesUrl = (category = selectedCategory.value) => {
  if (category === 'Alle') return CHALLENGES_API_URL
  return `${CHALLENGES_API_URL}?category=${encodeURIComponent(category)}`
}

// HIER: Dummy-Daten entfernt. Das Array startet leer und wird über das Backend befüllt.
const challenges = ref<Challenge[]>([])
const requestError = ref('')

const loadChallenges = async (category = selectedCategory.value) => {
  requestError.value = ''

  try {
    const response = await fetch(buildChallengesUrl(category))

    if (!response.ok) {
      throw new Error('Challenges konnten nicht geladen werden.')
    }

    challenges.value = await response.json()
  } catch {
    requestError.value = 'Die Challenges konnten nicht geladen werden. Bitte versuche es erneut.'
  }
}

onMounted(loadChallenges)

const filteredChallenges = computed(() => challenges.value)
const generatedChallenge = ref<ChallengeSuggestion | null>(null)
const suggestionSuccess = ref('')
const isLoadingSuggestion = ref(false)
const isSavingSuggestion = ref(false)

const selectCategory = async (category: string) => {
  selectedCategory.value = category
  await loadChallenges(category)
}

const progress = computed(() => {
  const total = challenges.value.length
  if (total === 0) return 0
  return Math.round((challenges.value.filter(c => c.done).length / total) * 100)
})

const toggleDone = async (challenge: Challenge) => {
  requestError.value = ''

  try {
    const response = await fetch(`${CHALLENGES_API_URL}/${challenge.id}/toggle`, {
      method: 'PATCH',
    })

    if (!response.ok) {
      throw new Error('Challenge konnte nicht aktualisiert werden.')
    }

    await loadChallenges()
  } catch {
    requestError.value = 'Die Challenge konnte nicht aktualisiert werden. Bitte versuche es erneut.'
  }
}

// ── Random Challenge ──────────────────────────────────────
const pickRandom = async () => {
  requestError.value = ''
  suggestionSuccess.value = ''
  try {
    isLoadingSuggestion.value = true
    const response = await fetch(`${CHALLENGES_API_URL}/suggestions/random`)

    if (!response.ok) {
      throw new Error('Zufällige Challenge konnte nicht geladen werden.')
    }

    generatedChallenge.value = await response.json()
  } catch {
    requestError.value = 'Die zufällige Challenge konnte nicht geladen werden. Bitte versuche es erneut.'
  } finally {
    isLoadingSuggestion.value = false
  }
}

// Neue Challenge hinzufügen aus KI-Vorschlag
const acceptGeneratedChallenge = async () => {
  requestError.value = ''
  suggestionSuccess.value = ''
  if (!generatedChallenge.value) return

  try {
    isSavingSuggestion.value = true
    const response = await fetch(CHALLENGES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generatedChallenge.value),
    })

    if (!response.ok) {
      throw new Error('Challenge konnte nicht gespeichert werden.')
    }

    await loadChallenges()
    generatedChallenge.value = null
    suggestionSuccess.value = 'Challenge wurde übernommen.'
  } catch {
    requestError.value = 'Die Challenge konnte nicht übernommen werden. Bitte versuche es erneut.'
  } finally {
    isSavingSuggestion.value = false
  }
}

// ── NEUE CHALLENGE (ADD) ──────────────────────────────────
const newTitle    = ref('')
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

    if (!response.ok) {
      throw new Error('Challenge konnte nicht gespeichert werden.')
    }

    await loadChallenges()
    newTitle.value = ''
    closeAddModalButton.value?.click()
  } catch {
    addChallengeError.value = 'Die Challenge konnte nicht gespeichert werden. Bitte versuche es erneut.'
  } finally {
    isSavingChallenge.value = false
  }
}

// ── CHALLENGE LÖSCHEN (DELETE) ────────────────────────────
const deleteChallenge = async (challenge: Challenge) => {
  if (!confirm(`Möchtest du die Aufgabe "${challenge.title}" wirklich löschen?`)) return;

  requestError.value = ''
  try {
    const response = await fetch(`${CHALLENGES_API_URL}/${challenge.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Challenge konnte nicht gelöscht werden.')
    }

    await loadChallenges()
  } catch {
    requestError.value = 'Die Challenge konnte nicht gelöscht werden. Bitte versuche es erneut.'
  }
}

// ── CHALLENGE BEARBEITEN (EDIT) ───────────────────────────
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
        // Der Erledigt-Status soll beim Bearbeiten gleich bleiben
        done: challenges.value.find(c => c.id === editingChallengeId.value)?.done || false,
      }),
    })

    if (!response.ok) {
      throw new Error('Challenge konnte nicht aktualisiert werden.')
    }

    await loadChallenges()
    closeEditModalButton.value?.click() // Edit Modal schließen
  } catch {
    editChallengeError.value = 'Die Challenge konnte nicht aktualisiert werden. Bitte versuche es erneut.'
  } finally {
    isSavingEdit.value = false
  }
}
</script>

<template>
  <div class="container pb-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">

        <div class="text-center mb-4">
          <h2 class="fw-bold">Guten Morgen, Beyza! 👋</h2>
          <p class="text-muted">Dein Fortschritt heute:</p>
          <div class="progress" style="height: 25px; border-radius: 15px;">
            <div
              class="progress-bar bg-success progress-bar-striped progress-bar-animated fw-bold"
              role="progressbar"
              :style="{ width: progress + '%' }"
            >
              {{ progress }}%
            </div>
          </div>
          <p class="text-muted small mt-2">
            {{ challenges.filter(c => c.done).length }} von {{ challenges.length }} erledigt
          </p>
        </div>

        <div class="d-flex gap-2 mb-3">
          <button
            class="btn btn-primary fw-bold shadow-sm flex-grow-1"
            data-bs-toggle="modal"
            data-bs-target="#addChallengeModal"
          >
            <i class="bi bi-plus-circle me-2"></i>Neue Challenge
          </button>

          <button
            class="btn btn-warning fw-bold shadow-sm flex-grow-1"
            @click="pickRandom"
            :disabled="isLoadingSuggestion"
          >
            <i class="bi bi-shuffle me-2"></i>{{ isLoadingSuggestion ? 'Generiere...' : 'Zufällige Challenge' }}
          </button>
        </div>

        <div v-if="requestError" class="alert alert-danger rounded-3">
          {{ requestError }}
        </div>

        <div v-if="suggestionSuccess" class="alert alert-success rounded-3">
          {{ suggestionSuccess }}
        </div>

        <div v-if="generatedChallenge" class="alert border-0 rounded-4 shadow-sm mb-3 d-flex align-items-center gap-3"
             style="background: linear-gradient(135deg, #fff3cd, #ffe69c);">
          <span style="font-size: 2rem;">🎯</span>
          <div class="flex-grow-1">
            <div class="fw-bold">Generierter Challenge-Vorschlag:</div>
            <div class="fs-5 fw-bold text-dark">{{ generatedChallenge.title }}</div>
            <span class="badge bg-secondary rounded-pill">{{ generatedChallenge.category }}</span>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-success fw-bold"
              :disabled="isSavingSuggestion"
              @click="acceptGeneratedChallenge"
            >
              {{ isSavingSuggestion ? 'Speichern...' : 'Challenge übernehmen' }}
            </button>
            <button
              class="btn-close"
              @click="generatedChallenge = null"
            ></button>
          </div>
        </div>

        <div
          v-if="challenges.filter(c => !c.done).length === 0 && challenges.length > 0"
          class="alert alert-success rounded-4 text-center fw-semibold mb-3"
        >
          🎉 Alle Challenges erledigt — fantastisch!
        </div>

        <CategoryFilter :selected="selectedCategory" @update:selected="selectCategory" />

        <div class="d-flex flex-column gap-3">
          <div
            v-for="challenge in filteredChallenges"
            :key="challenge.id"
          >
            <ChallengeCard
              :challenge="challenge"
              @toggle="toggleDone"
              @delete="deleteChallenge"
              @edit="openEditModal"
            />
          </div>
        </div>

        <div v-if="filteredChallenges.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-emoji-neutral display-4"></i>
          <p class="mt-2">Keine Challenges gefunden.</p>
        </div>

      </div>
    </div>

    <div class="modal fade" id="addChallengeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">

          <div class="modal-header border-bottom-0">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-plus-circle me-2 text-primary"></i>Neue Aufgabe
            </h5>
            <button ref="closeAddModalButton" type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div v-if="addChallengeError" class="alert alert-danger rounded-3">
              {{ addChallengeError }}
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Titel</label>
              <input
                v-model="newTitle"
                type="text"
                class="form-control rounded-3"
                placeholder="z.B. 20 Liegestütze"
                @keyup.enter="addChallenge"
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Kategorie</label>
              <select v-model="newCategory" class="form-select rounded-3">
                <option>Fitness</option>
                <option>Lernen</option>
                <option>Gesundheit</option>
                <option>Alltag</option>
                <option>Sozial</option>
              </select>
            </div>
          </div>

          <div class="modal-footer border-top-0">
            <button class="btn btn-light rounded-3" data-bs-dismiss="modal">Abbrechen</button>
            <button
              class="btn btn-primary rounded-3 px-4"
              :disabled="isSavingChallenge"
              @click="addChallenge"
            >
              {{ isSavingChallenge ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>

        </div>
      </div>
    </div>

    <div class="modal fade" id="editChallengeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">

          <div class="modal-header border-bottom-0">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-pencil me-2 text-primary"></i>Aufgabe bearbeiten
            </h5>
            <button ref="closeEditModalButton" type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div v-if="editChallengeError" class="alert alert-danger rounded-3">
              {{ editChallengeError }}
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Titel</label>
              <input
                v-model="editTitle"
                type="text"
                class="form-control rounded-3"
                @keyup.enter="saveEditChallenge"
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Kategorie</label>
              <select v-model="editCategory" class="form-select rounded-3">
                <option>Fitness</option>
                <option>Lernen</option>
                <option>Gesundheit</option>
                <option>Alltag</option>
                <option>Sozial</option>
              </select>
            </div>
          </div>

          <div class="modal-footer border-top-0">
            <button class="btn btn-light rounded-3" data-bs-dismiss="modal">Abbrechen</button>
            <button
              class="btn btn-primary rounded-3 px-4"
              :disabled="isSavingEdit"
              @click="saveEditChallenge"
            >
              {{ isSavingEdit ? 'Speichern...' : 'Änderungen speichern' }}
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>
