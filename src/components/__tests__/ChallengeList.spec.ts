import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChallengeList from '../ChallengeList.vue'
import ChallengeCard from '../ChallengeCard.vue'

interface Challenge {
  id?: number
  title: string
  category: string
  done: boolean
}

const API_URL = 'https://dailyhabit.onrender.com/api/v1/challenges'

const okResponse = (data: Challenge[]) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response)

const okChallengeResponse = (data: Challenge) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response)

const okEmptyResponse = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)

const errorResponse = (status = 500) =>
  Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as Response)

describe('ChallengeList', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // ── Bestehende Tests (unverändert) ────────────────────────

  it('loads filtered challenges from the backend when a category is selected', async () => {
    fetchMock
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
        { id: 2, title: 'Read', category: 'Lernen', done: false },
      ]))
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
      ]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text().includes('Fitness'))?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}?category=Fitness`)
    expect(wrapper.text()).toContain('Workout')
    expect(wrapper.text()).not.toContain('Read')
  })

  it('loads and displays a generated challenge suggestion from the backend', async () => {
    const suggestion = { title: 'Drink water', category: 'Gesundheit', done: false }

    fetchMock
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
      ]))
      .mockReturnValueOnce(okChallengeResponse(suggestion))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    await wrapper.find('.btn-warning').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/suggestions/random`)
    expect(wrapper.text()).toContain('Drink water')
    expect(wrapper.text()).toContain('Generierter Challenge-Vorschlag')
    expect(wrapper.text()).toContain('Challenge übernehmen')
  })

  it('accepts a generated challenge suggestion through POST and reloads the list', async () => {
    const suggestion = { title: 'Drink water', category: 'Gesundheit', done: false }

    fetchMock
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
      ]))
      .mockReturnValueOnce(okChallengeResponse(suggestion))
      .mockReturnValueOnce(okEmptyResponse())
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
        { id: 3, ...suggestion },
      ]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    await wrapper.find('.btn-warning').trigger('click')
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text().includes('Challenge übernehmen'))?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(3, API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(suggestion),
    })
    expect(fetchMock).toHaveBeenNthCalledWith(4, API_URL)
    expect(wrapper.text()).toContain('Challenge wurde übernommen.')
    expect(wrapper.text()).toContain('Drink water')
  })

  it('toggles a challenge through the backend using optimistic update', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }

    fetchMock
      .mockReturnValueOnce(okResponse([challenge]))           // initial load
      .mockReturnValueOnce(okEmptyResponse())                  // PATCH toggle
      .mockReturnValueOnce(okEmptyResponse())                  // refreshStreak (fire-and-forget)

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('toggle', challenge)
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/1/toggle`, { method: 'PATCH' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(wrapper.text()).toContain('1 von 1 erledigt')
  })

  // ── Neue Tests: CRUD ──────────────────────────────────────

  it('adds a challenge manually through POST and reloads the list', async () => {
    fetchMock
      .mockReturnValueOnce(okResponse([{ id: 1, title: 'Workout', category: 'Fitness', done: false }]))
      .mockReturnValueOnce(okEmptyResponse())
      .mockReturnValueOnce(okResponse([
        { id: 1, title: 'Workout', category: 'Fitness', done: false },
        { id: 2, title: 'Meditieren', category: 'Alltag', done: false },
      ]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    const addModal = wrapper.find('#addChallengeModal')
    await addModal.find('input').setValue('Meditieren')

    const saveButton = addModal.findAll('button').find(b => b.text().trim() === 'Speichern')
    await saveButton?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Meditieren', category: 'Alltag', done: false }),
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, API_URL)
    expect(wrapper.text()).toContain('Meditieren')
  })

  it('deletes a challenge through the backend and reloads the list', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fetchMock
      .mockReturnValueOnce(okResponse([challenge]))
      .mockReturnValueOnce(okEmptyResponse())
      .mockReturnValueOnce(okResponse([]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('delete', challenge)
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/1`, { method: 'DELETE' })
    expect(fetchMock).toHaveBeenNthCalledWith(3, API_URL)
    expect(wrapper.text()).not.toContain('Workout')
  })

  it('edits a challenge through PUT and reloads the list', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }
    const updated = { id: 1, title: 'Intensiv-Workout', category: 'Fitness', done: false }

    fetchMock
      .mockReturnValueOnce(okResponse([challenge]))
      .mockReturnValueOnce(okEmptyResponse())
      .mockReturnValueOnce(okResponse([updated]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('edit', challenge)
    await flushPromises()

    const editModal = wrapper.find('#editChallengeModal')
    await editModal.find('input').setValue('Intensiv-Workout')

    const saveButton = editModal.findAll('button').find(b => b.text().includes('Änderungen speichern'))
    await saveButton?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Intensiv-Workout', category: 'Fitness', done: false }),
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, API_URL)
    expect(wrapper.text()).toContain('Intensiv-Workout')
  })

  // ── Neue Tests: Leerzustand ───────────────────────────────

  it('shows an empty-state message and no error when the backend returns no challenges', async () => {
    fetchMock.mockReturnValueOnce(okResponse([]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    expect(wrapper.find('.alert-danger').exists()).toBe(false)
    expect(wrapper.text()).toContain('Keine Challenges gefunden.')
  })

  // ── Neue Tests: Fehlerfälle ───────────────────────────────

  it('shows requestError as alert-danger when fetch rejects during initial load', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    expect(wrapper.find('.alert-danger').exists()).toBe(true)
    expect(wrapper.text()).toContain('Die Challenges konnten nicht geladen werden.')
  })

  it('shows addChallengeError inside the modal when the server returns 500 on POST', async () => {
    fetchMock
      .mockReturnValueOnce(okResponse([]))
      .mockReturnValueOnce(errorResponse(500))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    const addModal = wrapper.find('#addChallengeModal')
    await addModal.find('input').setValue('Test Challenge')

    const saveButton = addModal.findAll('button').find(b => b.text().trim() === 'Speichern')
    await saveButton?.trigger('click')
    await flushPromises()

    const errorAlert = addModal.find('.alert-danger')
    expect(errorAlert.exists()).toBe(true)
    expect(errorAlert.text()).toContain('Die Challenge konnte nicht gespeichert werden.')
  })

  // ── Neue Tests: Guard-Fälle ───────────────────────────────

  it('does not send a POST request when the add title is empty', async () => {
    fetchMock.mockReturnValueOnce(okResponse([]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    // newTitle startet als '' — kein setValue nötig
    const saveButton = wrapper
      .find('#addChallengeModal')
      .findAll('button')
      .find(b => b.text().trim() === 'Speichern')
    await saveButton?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not send a PUT request when the edit title is cleared', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }

    fetchMock.mockReturnValueOnce(okResponse([challenge]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('edit', challenge)
    await flushPromises()

    await wrapper.find('#editChallengeModal input').setValue('')

    const saveButton = wrapper
      .find('#editChallengeModal')
      .findAll('button')
      .find(b => b.text().includes('Änderungen speichern'))
    await saveButton?.trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
