import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email: string
  role: string
  level: number
}

interface SessionPayload {
  user: User
  accessToken: string
  refreshToken: string
}

const REFRESH_TOKEN_KEY = 'rugby_refresh_token'
const USER_KEY = 'rugby_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user && !!state.accessToken,
  },

  actions: {
    // Salva sessione in memoria (accessToken) e localStorage (refreshToken + user)
    _setSession({ user, accessToken, refreshToken }: SessionPayload) {
      this.user = user
      this.accessToken = accessToken
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    clearSession() {
      this.user = null
      this.accessToken = null
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    async login(email: string, password: string) {
      const { apiBase } = useRuntimeConfig().public
      const data = await $fetch<SessionPayload>(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password },
      })
      this._setSession(data)
    },

    async googleAuth(idToken: string) {
      const { apiBase } = useRuntimeConfig().public
      const data = await $fetch<SessionPayload>(`${apiBase}/auth/google`, {
        method: 'POST',
        body: { idToken },
      })
      this._setSession(data)
    },

    // Ruota il refreshToken e aggiorna l'accessToken in memoria
    async tryRefresh(): Promise<boolean> {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) return false

      try {
        const { apiBase } = useRuntimeConfig().public
        const data = await $fetch<{ accessToken: string; refreshToken: string }>(
          `${apiBase}/auth/refresh`,
          { method: 'POST', body: { refreshToken } }
        )
        this.accessToken = data.accessToken
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
        return true
      } catch {
        this.clearSession()
        return false
      }
    },

    // Chiamato al boot dell'app: ripristina sessione da localStorage
    async initAuth() {
      const storedUser = localStorage.getItem(USER_KEY)
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!storedUser || !refreshToken) return

      this.user = JSON.parse(storedUser) as User
      const ok = await this.tryRefresh()
      if (!ok) this.clearSession()
    },

    logout() {
      this.clearSession()
      return navigateTo('/login')
    },
  },
})
