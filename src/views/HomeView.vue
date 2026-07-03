<script setup lang="ts">
import ChallengeList from '../components/ChallengeList.vue'
</script>

<template>
  <div class="page">
    <div class="container">

      <!-- HERO -->
      <div class="hero">
        <h1>Deine täglichen Challenges</h1>
        <p>Bleib dran und erreiche deine Ziele!</p>
      </div>

      <!-- CONTENT CARD WRAPPER -->
      <div class="panel">

        <ChallengeList />

      </div>

    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 30px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.hero p {
  color: #6b7280;
  margin-bottom: 20px;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.04);
}
</style>
