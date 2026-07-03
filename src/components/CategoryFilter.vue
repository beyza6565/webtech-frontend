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
  <div class="filter">
    <button
      v-for="cat in categories"
      :key="cat.name"
      class="filter-btn"
      :class="{ active: selected === cat.name }"
      @click="$emit('update:selected', cat.name)"
    >
      <i class="bi me-1" :class="cat.icon"></i>
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  border: 1px solid #e5e7eb;
  background: white;

  padding: 6px 12px;
  border-radius: 999px;

  font-size: 13px;
  font-weight: 500;

  cursor: pointer;
  transition: 0.2s;
}

.filter-btn:hover {
  background: #f9fafb;
}

.filter-btn.active {
  background: #111;
  color: white;
  border-color: #111;
}
</style>
