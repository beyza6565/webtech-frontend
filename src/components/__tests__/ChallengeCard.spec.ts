import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChallengeCard from '../ChallengeCard.vue'
import type { Challenge } from '../../types/challenge'

const openChallenge: Challenge = { id: 1, title: 'Workout', category: 'Fitness', done: false }
const doneChallenge: Challenge = { id: 2, title: 'Lesen', category: 'Lernen', done: true }

describe('ChallengeCard', () => {
  it('emits toggle with the challenge when the complete button is clicked', async () => {
    const wrapper = mount(ChallengeCard, { props: { challenge: openChallenge } })

    await wrapper.find('.action-btn.complete').trigger('click')

    expect(wrapper.emitted('toggle')?.[0]).toEqual([openChallenge])
  })

  it('emits delete with the challenge when the trash button is clicked', async () => {
    const wrapper = mount(ChallengeCard, { props: { challenge: openChallenge } })

    await wrapper.find('.action-btn.delete').trigger('click')

    expect(wrapper.emitted('delete')?.[0]).toEqual([openChallenge])
  })

  it('emits edit with the challenge when the pencil button is clicked', async () => {
    const wrapper = mount(ChallengeCard, { props: { challenge: openChallenge } })

    await wrapper.find('.action-btn.edit').trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([openChallenge])
  })

  it('renders strikethrough title and is-done styling for a done challenge', () => {
    const wrapper = mount(ChallengeCard, { props: { challenge: doneChallenge } })

    expect(wrapper.find('.text-decoration-line-through').exists()).toBe(true)
    expect(wrapper.find('.challenge-row').classes()).toContain('is-done')
  })

  it('shows the undo icon and "Wieder offen" title for a done challenge toggle button', () => {
    const wrapper = mount(ChallengeCard, { props: { challenge: doneChallenge } })

    const toggleButton = wrapper.find('.action-btn.complete')
    expect(toggleButton.attributes('title')).toBe('Wieder offen')
    expect(toggleButton.find('i').classes()).toContain('bi-arrow-counterclockwise')
  })
})
