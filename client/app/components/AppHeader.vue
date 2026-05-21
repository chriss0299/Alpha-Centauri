<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__logo">
      RugbyTracker
    </NuxtLink>
    <button class="app-header__notifications" aria-label="Notifiche" disabled>
      <Icon name="heroicons:bell" size="24" />
      <span class="app-header__badge">0</span>
    </button>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.app-header__logo {
  font-weight: 700;
  font-size: 1.125rem;
  color: #f0f0f0;
  text-decoration: none;
  letter-spacing: 0.02em;
}

.app-header__notifications {
  position: relative;
  background: none;
  border: none;
  color: #f0f0f0;
  cursor: default;
  padding: 0.25rem;
  opacity: 0.7;
}

.app-header__badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e63946;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 0.25rem;
  min-width: 16px;
  text-align: center;
  line-height: 16px;
}
</style>
