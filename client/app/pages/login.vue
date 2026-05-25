<template>
  <div class="login-page">
    <!-- Sfondo stadio -->
    <div class="login-page__bg" aria-hidden="true">
      <img src="/images/login-bg.jpg" alt="" class="login-page__bg-img" />
      <div class="login-page__bg-overlay" />
    </div>

    <!-- Contenuto -->
    <div class="login-page__content">
      <div class="login-page__header">
        <h1 class="login-page__title">Accedi</h1>
        <p class="login-page__subtitle">Il rugby di categoria al tuo polso</p>
      </div>

      <div class="login-page__actions">
        <!-- Pulsante Google custom → prompt() -->
        <button class="gsi-material-button" :disabled="loading" @click="googleSignIn">
          <div class="gsi-material-button-state" />
          <div class="gsi-material-button-content-wrapper">
            <div class="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </div>
            <span class="gsi-material-button-contents">Accedi con Google</span>
          </div>
        </button>

        <p class="login-page__divider">— oppure accedi con mail —</p>

        <!-- Form email/password -->
        <form class="login-form" @submit.prevent="handleEmailLogin">
          <input
            v-model="emailForm.email"
            type="email"
            class="login-form__input"
            placeholder="Email"
            autocomplete="email"
            required
          />
          <input
            v-model="emailForm.password"
            type="password"
            class="login-form__input"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
          <button type="submit" class="btn btn--email" :disabled="loading">
            {{ loading ? 'Accesso in corso…' : 'Accedi' }}
          </button>
          <p class="login-form__forgot">
            Hai dimenticato la tua password?
            <NuxtLink to="/recupera-password" class="login-form__forgot-link">Recupera</NuxtLink>
          </p>
        </form>
      </div>

      <p v-if="errorMessage" class="login-page__error" role="alert">
        {{ errorMessage }}
      </p>

      <p class="login-page__switch">
        Non hai un account?
        <NuxtLink to="/registrati" class="login-page__switch-link">Registrati</NuxtLink>
      </p>
    </div>

    <!-- Footer legale -->
    <p class="login-page__legal">
      Continuando accetti i <a href="#" class="login-page__legal-link">Termini di servizio</a>
      e la <a href="#" class="login-page__legal-link">Privacy Policy</a>
    </p>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'guest' })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Teko:wght@700&family=Quantico:wght@400;700&display=swap',
    },
  ],
})

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const emailForm = reactive({ email: '', password: '' })

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data
    return data?.error ?? null
  }
  return null
}

async function handleEmailLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(emailForm.email, emailForm.password)
    await router.push('/')
  } catch (err: unknown) {
    errorMessage.value = extractError(err) ?? 'Email o password non corretti'
  } finally {
    loading.value = false
  }
}

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

function googleSignIn() {
  const { googleClientId } = useRuntimeConfig().public
  const nonce = Math.random().toString(36).substring(2)
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`)
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${googleClientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=id_token` +
    `&scope=openid%20email%20profile` +
    `&nonce=${nonce}`

  const popup = window.open(url, 'google_auth', 'width=500,height=600,left=200,top=100')
  if (!popup) {
    errorMessage.value = 'Popup bloccato dal browser. Consenti i popup per questo sito.'
    return
  }

  const bc = new BroadcastChannel('google_auth')
  bc.onmessage = async (event: MessageEvent) => {
    bc.close()
    if (event.data?.type === 'google_auth') {
      await handleGoogleCredential({ credential: event.data.idToken })
    }
  }
}

</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #181b27;
  overflow: hidden;
  font-family: 'Quantico', sans-serif;
}

/* Sfondo */
.login-page__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.login-page__bg-img {
  position: absolute;
  width: 201%;
  height: 112%;
  top: -1.7%;
  left: -51%;
  object-fit: cover;
  opacity: 0.82;
}

.login-page__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(24, 27, 39, 0.1) 0%,
    rgba(24, 27, 39, 0.5) 50%,
    rgba(24, 27, 39, 0.85) 100%
  );
}

/* Contenuto */
.login-page__content {
  position: relative;
  z-index: 1;
  padding: 0 24px 80px;
}

.login-page__header {
  margin-bottom: 100px;
}

.login-page__title {
  font-family: 'Teko', sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #ffffff;
  line-height: 1;
  text-align: center;
  margin: 0 0 24px;
}

.login-page__subtitle {
  font-family: 'Quantico', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
}

/* Pulsanti */
.login-page__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  font-family: 'Quantico', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
  gap: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
}

.gsi-material-button {
  user-select: none;
  background-color: #f2f2f2;
  border: none;
  border-radius: 14px;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 52px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 16px;
  position: relative;
  text-align: center;
  transition: background-color 0.218s, box-shadow 0.218s;
  white-space: nowrap;
  width: 100%;
}

.gsi-material-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.gsi-material-button:not(:disabled):hover {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.gsi-material-button-state {
  transition: opacity 0.218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button-content-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: center;
  gap: 12px;
  position: relative;
  width: 100%;
}

.gsi-material-button-icon {
  height: 20px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button-contents {
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  font-size: 15px;
}

.btn--email {
  background-color: #0f3460;
  color: #ffffff;
  font-size: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-form__input {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-family: 'Quantico', sans-serif;
  font-size: 15px;
  padding: 0 16px;
  outline: none;
  transition: border-color 0.15s;
}

.login-form__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.login-form__input:focus {
  border-color: rgba(255, 255, 255, 0.5);
}

.login-form__forgot {
  font-family: 'Quantico', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.login-form__forgot-link {
  font-weight: 700;
  color: #f59e0b;
  text-decoration: none;
}

/* Separatore */
.login-page__divider {
  font-family: 'Quantico', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 4px 0;
}

/* Errore */
.login-page__error {
  font-size: 0.8125rem;
  color: #e63946;
  text-align: center;
  margin: 12px 0 0;
}

/* Link registrazione */
.login-page__switch {
  font-family: 'Quantico', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 20px 0 32px;
}

.login-page__switch-link {
  font-weight: 700;
  color: #f59e0b;
  text-decoration: none;
}

/* Footer legale */
.login-page__legal {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  text-align: center;
  padding: 0 45px 32px;
  line-height: 16px;
}

.login-page__legal-link {
  color: #f59e0b;
  text-decoration: underline;
}

</style>
