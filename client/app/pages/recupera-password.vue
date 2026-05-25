<template>
  <div class="recover-page">
    <img src="/images/nothing-we-can-do.jpeg" alt="There is nothing we can do" class="recover-page__meme" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<style scoped>
.recover-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.recover-page__meme {
  width: 100%;
  max-width: 700px;
  height: 100dvh;
  object-fit: contain;
}
</style>
