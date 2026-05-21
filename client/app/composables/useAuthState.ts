// Wrapper leggero sul Pinia store — mantiene compatibilità con componenti esistenti
export const useAuthState = () => {
  const authStore = useAuthStore()
  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
  }
}
