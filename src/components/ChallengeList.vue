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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dailyhabit.onrender.com'
const CHALLENGES_API_URL = `${API_BASE_URL}/api/v1/challenges`
const selectedCategory = ref('Alle')

const buildChallengesUrl = (category = selectedCategory.value) => {
  if (category === 'Alle') return CHALLENGES_API_URL
  return `${CHALLENGES_API_URL}?category=${encodeURIComponent(category)}`
}

const challenges = ref<Challenge[]>([
  { id: 1, title: '10.000 Schritte gehen',category: 'Fitness', done: false},
  { id: 2, title: '15 Minuten lesen',category: 'Lernen', done: true},
  { id: 3, title: 'Glas Wasser trinken', category: 'Gesundheit', done: false},
  { id: 4, title: '20 Liegestütze',category: 'Fitness', done: false,  },
  { id: 5, title: 'Neues Wort auf Englisch',category: 'Lernen', done: false},
  { id: 6, title: 'Zimmer aufräumen', category: 'Alltag', done: false},
])

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
const highlighted = ref<Challenge | null>(null)

const selectCategory = async (category: string) => {
  selectedCategory.value = category
  highlighted.value = null
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
  try {
    const response = await fetch(`${CHALLENGES_API_URL}/random`)

    if (!response.ok) {
      throw new Error('Zufällige Challenge konnte nicht geladen werden.')
    }

    highlighted.value = await response.json()
    selectedCategory.value = 'Alle'
    await loadChallenges('Alle')
  } catch {
    requestError.value = 'Die zufällige Challenge konnte nicht geladen werden. Bitte versuche es erneut.'
  }
}

  // Kategorie zurücksetzen damit die Challenge sichtbar ist
// ─────────────────────────────────────────────────────────

// Neue Challenge hinzufügen
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
</script>

<template>
  <div class="container pb-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">

        <!-- Fortschritt -->
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

        <!-- Buttons -->
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
          >
            <i class="bi bi-shuffle me-2"></i>Zufällige Challenge
          </button>
        </div>

        <div v-if="requestError" class="alert alert-danger rounded-3">
          {{ requestError }}
        </div>

        <!-- Zufällige Challenge Anzeige -->
        <div v-if="highlighted" class="alert border-0 rounded-4 shadow-sm mb-3 d-flex align-items-center gap-3"
             style="background: linear-gradient(135deg, #fff3cd, #ffe69c);">
          <span style="font-size: 2rem;">🎯</span>
          <div>
            <div class="fw-bold">Deine Challenge für heute:</div>
            <div class="fs-5 fw-bold text-dark">{{ highlighted.title }}</div>
            <span class="badge bg-secondary rounded-pill">{{ highlighted.category }}</span>
          </div>
          <button
            class="btn-close ms-auto"
            @click="highlighted = null"
          ></button>
        </div>

        <!-- Keine offenen Challenges mehr -->
        <div
          v-if="challenges.filter(c => !c.done).length === 0"
          class="alert alert-success rounded-4 text-center fw-semibold mb-3"
        >
          🎉 Alle Challenges erledigt — fantastisch!
        </div>

        <!-- Kategoriefilter -->
        <CategoryFilter :selected="selectedCategory" @update:selected="selectCategory" />

        <!-- Challenge-Karten mit v-for ✅ -->
        <div class="d-flex flex-column gap-3">
          <div
            v-for="challenge in filteredChallenges"
            :key="challenge.id"
          >
            <!-- Hervorhebung der zufälligen Challenge -->
            <div
              v-if="challenge.id === highlighted?.id"
              class="border border-warning border-3 rounded-4"
            >
              <ChallengeCard :challenge="challenge" @toggle="toggleDone" />
            </div>
            <ChallengeCard v-else :challenge="challenge" @toggle="toggleDone" />
          </div>
        </div>

        <!-- Leer-Zustand -->
        <div v-if="filteredChallenges.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-emoji-neutral display-4"></i>
          <p class="mt-2">Keine Challenges in dieser Kategorie.</p>
        </div>

      </div>
    </div>

    <!-- Modal: Neue Challenge -->
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
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Kategorie</label>
              <select v-model="newCategory" class="form-select rounded-3">
                <option>Fitness</option>
                <option>Lernen</option>
                <option>Gesundheit</option>
                <option>Alltag</option>
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

  </div>
</template>
