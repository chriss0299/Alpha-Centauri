<template>
  <div class="layout">
    <AppHeader />
    <main class="layout__main">
      <slot />
    </main>
    <AppFooter />
    <AppBottomNav />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #0f0f1a;
  color: #f0f0f0;
}

.layout__main {
  flex: 1;
  padding-top: 56px;   /* altezza AppHeader */
  padding-bottom: 60px; /* altezza AppBottomNav su mobile */
}

@media (min-width: 768px) {
  .layout__main {
    padding-bottom: 0;
  }
}
</style>
