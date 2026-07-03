<script setup lang="ts">
defineProps<{ selected: string }>()
defineEmits<{ (e: 'update:selected', value: string): void }>()

const categories = [
  { name: 'Alle',       icon: 'bi-grid'      },
  { name: 'Fitness',    icon: 'bi-lightning'  },
  { name: 'Lernen',     icon: 'bi-book'       },
  { name: 'Gesundheit', icon: 'bi-heart'      },
  { name: 'Alltag',     icon: 'bi-house'      },
  { name: 'Sozial',     icon: 'bi-people'     },
]
</script>

<template>
  <div class="filter-container">
    <button
      v-for="cat in categories"
      :key="cat.name"
      class="filter-btn"
      :class="{ active: selected === cat.name }"
      @click="$emit('update:selected', cat.name)"
    >
      <i class="bi me-2" :class="cat.icon"></i>
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-btn {
  border: 1px solid #e5e7eb;
  background: white;
  color: #4b5563;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-btn.active {
  background: #2563eb; /* Blau wie im Mockup */
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
</style>
