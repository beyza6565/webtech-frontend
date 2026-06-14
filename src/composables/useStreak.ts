import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dailyhabit.onrender.com'
const STREAK_API_URL = `${API_BASE_URL}/api/v1/streak`

// Modul-weit geteilte Refs — ein einziger Zustand für App.vue und ChallengeList.vue
const streak = ref(0)
const completedToday = ref(false)
const isLoadingStreak = ref(false)

async function refreshStreak(): Promise<void> {
  try {
    isLoadingStreak.value = true
    const response = await fetch(STREAK_API_URL)
    if (!response.ok) return
    const data: { streak: number; completedToday: boolean } = await response.json()
    streak.value = data.streak
    completedToday.value = data.completedToday
  } catch {
    // Streak ist sekundär — kein sichtbarer Fehler bei Netzwerkproblemen
  } finally {
    isLoadingStreak.value = false
  }
}

export function useStreak() {
  return { streak, completedToday, isLoadingStreak, refreshStreak }
}
