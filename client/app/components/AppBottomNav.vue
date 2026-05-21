<template>
  <nav class="bottom-nav" role="navigation" aria-label="Navigazione principale">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(item) }"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <Icon :name="isActive(item) ? item.iconActive : item.icon" size="22" />
      <span class="bottom-nav__label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { isAuthenticated } = useAuthState()

const navItems = computed(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'heroicons:home',
    iconActive: 'heroicons:home-20-solid',
    exact: true,
  },
  {
    label: 'Competizioni',
    to: '/competizioni',
    icon: 'heroicons:trophy',
    iconActive: 'heroicons:trophy-20-solid',
    exact: false,
  },
  {
    label: 'Cerca',
    to: '/cerca',
    icon: 'heroicons:magnifying-glass',
    iconActive: 'heroicons:magnifying-glass',
    exact: false,
  },
  {
    label: 'Live',
    to: '/live',
    icon: 'heroicons:signal',
    iconActive: 'heroicons:signal-20-solid',
    exact: false,
  },
  {
    label: isAuthenticated.value ? 'Profilo' : 'Accedi',
    to: isAuthenticated.value ? '/profilo' : '/login',
    icon: isAuthenticated.value ? 'heroicons:user' : 'heroicons:arrow-right-end-on-rectangle',
    iconActive: isAuthenticated.value ? 'heroicons:user-20-solid' : 'heroicons:arrow-right-end-on-rectangle',
    exact: false,
  },
])

const isActive = (item: { to: string; exact: boolean }) => {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #1a1a2e;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: rgba(240, 240, 240, 0.5);
  text-decoration: none;
  font-size: 0.625rem;
  padding: 0.25rem 0;
  transition: color 0.15s ease;
}

.bottom-nav__item--active {
  color: #4f8ef7;
}

.bottom-nav__label {
  line-height: 1;
}
</style>
