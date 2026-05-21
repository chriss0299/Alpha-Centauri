<template>
  <footer class="app-footer">
    <span>RugbyTracker Community &copy; {{ year }}</span>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  display: none;
  background-color: #1a1a2e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(240, 240, 240, 0.4);
}

@media (min-width: 768px) {
  .app-footer {
    display: block;
  }
}
</style>
