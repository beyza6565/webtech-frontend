<script setup lang="ts">
import ChallengeList from '../components/ChallengeList.vue'
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="panel">
        <ChallengeList />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: transparent; /* Geändert, damit App.vue den Hintergrund steuert */
  padding: 30px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.04);
}
</style>
