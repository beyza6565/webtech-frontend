import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../../App.vue'
import ChallengeList from '../ChallengeList.vue'
import ChallengeCard from '../ChallengeCard.vue'
import { useStreak } from '../../composables/useStreak'

const API_BASE = 'https://dailyhabit.onrender.com'
const STREAK_URL = `${API_BASE}/api/v1/streak`
const CHALLENGES_URL = `${API_BASE}/api/v1/challenges`

const okJson = (data: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)

// App.vue benötigt einen Router-Kontext; ohne ihn laufen vue-router-interne
// Computed-Refs in einen Fehler, auch wenn RouterView gestubbt ist.
const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })

describe('Streak-Integration', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    // Modul-weit geteilte Refs vor jedem Test auf Ausgangswert zurücksetzen
    const { streak, completedToday } = useStreak()
    streak.value = 0
    completedToday.value = false
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('App.vue ruft GET /api/v1/streak beim Mounten auf und zeigt den Wert in der Navbar', async () => {
    fetchMock.mockReturnValueOnce(okJson({ streak: 5, completedToday: true }))

    const wrapper = mount(App, {
      global: {
        plugins: [createTestRouter()],
        stubs: { RouterView: true },
      },
    })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(STREAK_URL)
    expect(wrapper.text()).toContain('5 Tage Streak')
  })

  it('App.vue zeigt "Noch keine Streak" wenn der Endpunkt streak: 0 zurückliefert', async () => {
    fetchMock.mockReturnValueOnce(okJson({ streak: 0, completedToday: false }))

    const wrapper = mount(App, {
      global: {
        plugins: [createTestRouter()],
        stubs: { RouterView: true },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Noch keine Streak')
    expect(wrapper.text()).not.toContain('Tage Streak')
  })

  it('ChallengeList.vue ruft GET /api/v1/streak nach einem erfolgreichen Toggle erneut auf', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }

    fetchMock
      .mockReturnValueOnce(okJson([challenge]))                           // onMounted loadChallenges
      .mockReturnValueOnce(okJson({}))                                    // PATCH /1/toggle
      .mockReturnValueOnce(okJson([{ ...challenge, done: true }]))        // reload nach Toggle
      .mockReturnValueOnce(okJson({ streak: 1, completedToday: true }))  // refreshStreak

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('toggle', challenge)
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${CHALLENGES_URL}/1/toggle`, { method: 'PATCH' })
    expect(fetchMock).toHaveBeenNthCalledWith(3, CHALLENGES_URL)
    expect(fetchMock).toHaveBeenNthCalledWith(4, STREAK_URL)
  })
})
