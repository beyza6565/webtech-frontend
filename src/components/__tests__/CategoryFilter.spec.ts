import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilter from '../CategoryFilter.vue'

describe('CategoryFilter', () => {
  it('emits update:selected with the correct category name when a button is clicked', async () => {
    const wrapper = mount(CategoryFilter, { props: { selected: 'Alle' } })

    await wrapper.findAll('button').find(b => b.text().includes('Fitness'))?.trigger('click')

    expect(wrapper.emitted('update:selected')?.[0]).toEqual(['Fitness'])
  })

  it('renders a button for every category including Sozial', () => {
    const wrapper = mount(CategoryFilter, { props: { selected: 'Alle' } })

    const buttonTexts = wrapper.findAll('button').map(b => b.text())
    for (const name of ['Alle', 'Fitness', 'Lernen', 'Gesundheit', 'Alltag', 'Sozial']) {
      expect(buttonTexts.some(t => t.includes(name))).toBe(true)
    }
  })

  it('applies btn-dark to the active category and btn-outline-secondary to the others', () => {
    const wrapper = mount(CategoryFilter, { props: { selected: 'Fitness' } })

    const fitnessButton = wrapper.findAll('button').find(b => b.text().includes('Fitness'))
    const alleButton = wrapper.findAll('button').find(b => b.text().includes('Alle'))

    expect(fitnessButton?.classes()).toContain('btn-dark')
    expect(alleButton?.classes()).toContain('btn-outline-secondary')
  })
})
