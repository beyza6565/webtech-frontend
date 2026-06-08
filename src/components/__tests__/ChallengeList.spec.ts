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

describe('ChallengeList', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('toggles a challenge through the backend and reloads the list', async () => {
    const challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }

    fetchMock
      .mockReturnValueOnce(okResponse([challenge]))
      .mockReturnValueOnce(okEmptyResponse())
      .mockReturnValueOnce(okResponse([{ ...challenge, done: true }]))

    const wrapper = mount(ChallengeList)
    await flushPromises()

    wrapper.findComponent(ChallengeCard).vm.$emit('toggle', challenge)
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/1/toggle`, { method: 'PATCH' })
    expect(fetchMock).toHaveBeenNthCalledWith(3, API_URL)
    expect(wrapper.text()).toContain('1 von 1 erledigt')
  })
})
