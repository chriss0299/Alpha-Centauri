export const useAuthState = () => {
  const user = useState<{ name: string; avatar?: string } | null>('auth-user', () => null)
  const isAuthenticated = computed(() => user.value !== null)
  return { user, isAuthenticated }
}
