<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__logo">
      RugbyTracker
    </NuxtLink>

    <nav class="app-header__nav" aria-label="Navigazione principale">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="app-header__nav-link"
        :class="{ 'app-header__nav-link--active': isActive(item) }"
        :aria-current="isActive(item) ? 'page' : undefined"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <button class="app-header__notifications" aria-label="Notifiche" disabled>
      <Icon name="heroicons:bell" size="24" />
      <span class="app-header__badge">0</span>
    </button>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { isAuthenticated } = useAuthState()

const navItems = computed(() => [
  { label: 'Home',         to: '/',             exact: true  },
  { label: 'Competizioni', to: '/competizioni',  exact: false },
  { label: 'Cerca',        to: '/cerca',         exact: false },
  { label: 'Live',         to: '/live',          exact: false },
  {
    label: isAuthenticated.value ? 'Profilo' : 'Accedi',
    to:    isAuthenticated.value ? '/profilo' : '/login',
    exact: false,
  },
])

const isActive = (item: { to: string; exact: boolean }) =>
  item.exact ? route.path === item.to : route.path.startsWith(item.to)
</script>

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

/* Nav desktop — nascosta su mobile */
.app-header__nav {
  display: none;
}

@media (min-width: 768px) {
  .app-header__nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.app-header__nav-link {
  color: rgba(240, 240, 240, 0.55);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  transition: color 0.15s, background-color 0.15s;
}

.app-header__nav-link:hover {
  color: #f0f0f0;
  background-color: rgba(255, 255, 255, 0.06);
}

.app-header__nav-link--active {
  color: #4f8ef7;
  background-color: rgba(79, 142, 247, 0.1);
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
