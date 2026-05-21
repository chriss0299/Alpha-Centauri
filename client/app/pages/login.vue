<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__title">RugbyTracker</h1>
      <p class="login-card__subtitle">Accedi per seguire le partite in diretta</p>

      <form class="login-form" @submit.prevent="submitLogin">
        <div class="login-form__field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="la-tua@email.com"
            :disabled="loading"
            required
          />
        </div>

        <div class="login-form__field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :disabled="loading"
            required
          />
        </div>

        <p v-if="errorMessage" class="login-form__error" role="alert">
          {{ errorMessage }}
        </p>

        <button type="submit" class="btn btn--primary" :disabled="loading">
          <span v-if="loading">Accesso in corso…</span>
          <span v-else>Accedi</span>
        </button>
      </form>

      <div class="login-separator">
        <span>oppure</span>
      </div>

      <div id="google-signin-btn" class="login-google" />

      <p class="login-card__register">
        Non hai un account?
        <NuxtLink to="/registrati">Registrati</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  script: [{ src: 'https://accounts.google.com/gsi/client', async: true, defer: true }],
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')

async function submitLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    await router.push('/')
  } catch (err: unknown) {
    errorMessage.value = extractError(err) ?? 'Credenziali non valide'
  } finally {
    loading.value = false
  }
}

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data
    return data?.error ?? null
  }
  return null
}

// Inizializza Google Sign-In dopo che lo script è caricato
onMounted(() => {
  const { googleClientId } = useRuntimeConfig().public
  if (!googleClientId) return

  const waitForGoogle = setInterval(() => {
    if (!window.google?.accounts?.id) return
    clearInterval(waitForGoogle)

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    })

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-btn')!,
      { theme: 'filled_black', size: 'large', width: 320, text: 'signin_with' }
    )
  }, 100)
})

async function handleGoogleCredential(response: { credential: string }) {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.googleAuth(response.credential)
    await router.push('/')
  } catch (err: unknown) {
    errorMessage.value = extractError(err) ?? 'Accesso con Google non riuscito'
  } finally {
    loading.value = false
  }
}

// Tipi per la Google Identity Services API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void
          renderButton: (element: HTMLElement, config: object) => void
        }
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f0f1a;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background-color: #1a1a2e;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.login-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0f0f0;
  text-align: center;
  margin: 0 0 0.25rem;
}

.login-card__subtitle {
  font-size: 0.875rem;
  color: rgba(240, 240, 240, 0.6);
  text-align: center;
  margin: 0 0 1.75rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.login-form__field label {
  font-size: 0.8125rem;
  color: rgba(240, 240, 240, 0.75);
  font-weight: 500;
}

.login-form__field input {
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  color: #f0f0f0;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}

.login-form__field input:focus {
  border-color: rgba(255, 255, 255, 0.35);
}

.login-form__field input::placeholder {
  color: rgba(240, 240, 240, 0.3);
}

.login-form__field input:disabled {
  opacity: 0.5;
}

.login-form__error {
  font-size: 0.8125rem;
  color: #e63946;
  margin: 0;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn--primary {
  background-color: #e63946;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.login-separator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  color: rgba(240, 240, 240, 0.35);
  font-size: 0.8125rem;
}

.login-separator::before,
.login-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.login-google {
  display: flex;
  justify-content: center;
}

.login-card__register {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(240, 240, 240, 0.55);
  margin: 1.5rem 0 0;
}

.login-card__register a {
  color: #f0f0f0;
  font-weight: 600;
  text-decoration: none;
}

.login-card__register a:hover {
  text-decoration: underline;
}
</style>
