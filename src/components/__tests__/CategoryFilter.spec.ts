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

  it('applies the active class to the selected category and only filter-btn to the others', () => {
    const wrapper = mount(CategoryFilter, { props: { selected: 'Fitness' } })

    const fitnessButton = wrapper.findAll('button').find(b => b.text().includes('Fitness'))
    const alleButton = wrapper.findAll('button').find(b => b.text().includes('Alle'))

    // Der ausgewählte Button hat die Klasse 'active'
    expect(fitnessButton?.classes()).toContain('active')

    // Der nicht-ausgewählte Button hat 'filter-btn', aber NICHT 'active'
    expect(alleButton?.classes()).toContain('filter-btn')
    expect(alleButton?.classes()).not.toContain('active')
  })
})
