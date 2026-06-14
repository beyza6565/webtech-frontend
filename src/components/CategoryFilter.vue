<script setup lang="ts">
defineProps<{ selected: string }>()
defineEmits<{ (e: 'update:selected', value: string): void }>()

const categories = [
  { name: 'Alle',       icon: 'bi-grid-fill'      },
  { name: 'Fitness',    icon: 'bi-lightning-fill'  },
  { name: 'Lernen',     icon: 'bi-book-fill'       },
  { name: 'Gesundheit', icon: 'bi-heart-fill'      },
  { name: 'Alltag',     icon: 'bi-house-fill'      },
  { name: 'Sozial',     icon: 'bi-people-fill'     },
]
</script>

<template>
  <div class="d-flex flex-wrap gap-2 mb-4">
    <button
      v-for="cat in categories"
      :key="cat.name"
      class="btn btn-sm rounded-pill fw-semibold"
      :class="selected === cat.name ? 'btn-dark' : 'btn-outline-secondary'"
      @click="$emit('update:selected', cat.name)"
    >
      <i class="bi me-1" :class="cat.icon"></i>{{ cat.name }}
    </button>
  </div>
</template>
