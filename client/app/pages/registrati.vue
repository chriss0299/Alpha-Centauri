<template>
  <div class="register-page">
    <!-- Sfondo stadio -->
    <div class="register-page__bg" aria-hidden="true">
      <img src="/images/login-bg.jpg" alt="" class="register-page__bg-img" />
      <div class="register-page__bg-overlay" />
    </div>

    <!-- Contenuto -->
    <div class="register-page__content">
      <div class="register-page__header">
        <h1 class="register-page__title">Registrati</h1>
        <p class="register-page__subtitle">Il rugby di categoria al tuo polso</p>
      </div>

      <div class="register-page__actions">
        <!-- Google custom → prompt() -->
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
            <span class="gsi-material-button-contents">Registrati con Google</span>
          </div>
        </button>

        <p class="register-page__divider">— oppure registrati con mail —</p>

        <!-- Form -->
        <form class="register-form" @submit.prevent="handleRegister">
          <input
            v-model="form.username"
            type="text"
            class="register-form__input"
            placeholder="Username"
            autocomplete="username"
            minlength="3"
            maxlength="30"
            required
          />
          <input
            v-model="form.email"
            type="email"
            class="register-form__input"
            placeholder="Email"
            autocomplete="email"
            required
          />
          <div class="register-form__password-wrap">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="register-form__input"
              placeholder="Password"
              autocomplete="new-password"
              minlength="8"
              required
            />
            <button type="button" class="register-form__toggle" @click="showPassword = !showPassword">
              <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" size="20" />
            </button>
          </div>

          <!-- Indicatore forza password -->
          <div v-if="form.password" class="password-strength">
            <div class="password-strength__bar">
              <div class="password-strength__fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }" />
            </div>
            <span class="password-strength__label" :class="strengthClass">{{ strengthLabel }}</span>
          </div>

          <div class="register-form__password-wrap">
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="register-form__input"
              :class="{ 'register-form__input--error': confirmMismatch }"
              placeholder="Conferma password"
              autocomplete="new-password"
              required
            />
            <button type="button" class="register-form__toggle" @click="showConfirm = !showConfirm">
              <Icon :name="showConfirm ? 'mdi:eye-off' : 'mdi:eye'" size="20" />
            </button>
          </div>

          <button type="submit" class="btn btn--email" :disabled="loading || confirmMismatch">
            {{ loading ? 'Registrazione in corso…' : 'Registrati' }}
          </button>
        </form>
      </div>

      <p v-if="errorMessage" class="register-page__error" role="alert">
        {{ errorMessage }}
      </p>

      <p class="register-page__switch">
        Hai già un account?
        <NuxtLink to="/login" class="register-page__switch-link">Accedi</NuxtLink>
      </p>
    </div>

    <!-- Footer legale -->
    <p class="register-page__legal">
      Continuando accetti i <a href="#" class="register-page__legal-link">Termini di servizio</a>
      e la <a href="#" class="register-page__legal-link">Privacy Policy</a>
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
const showPassword = ref(false)
const showConfirm = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const confirmMismatch = computed(
  () => form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

const strengthScore = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthPercent = computed(() => (strengthScore.value / 5) * 100)

const strengthLabel = computed(() => {
  if (strengthScore.value <= 1) return 'Debole'
  if (strengthScore.value <= 3) return 'Media'
  return 'Forte'
})

const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'weak'
  if (strengthScore.value <= 3) return 'medium'
  return 'strong'
})

function extractError(err: unknown): string | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { error?: string } }).data
    return data?.error ?? null
  }
  return null
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

async function handleRegister() {
  if (confirmMismatch.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    const { apiBase } = useRuntimeConfig().public
    await $fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      body: { username: form.username, email: form.email, password: form.password },
    })
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    // 409 = email già registrata: redirect comunque (anti-enumeration)
    if (status !== 409) {
      errorMessage.value = extractError(err) ?? 'Registrazione non riuscita'
      loading.value = false
      return
    }
  }
  await router.push(`/conferma-email?email=${encodeURIComponent(form.email)}`)
  loading.value = false
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

</script>

<style scoped>
.register-page {
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

.register-page__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.register-page__bg-img {
  position: absolute;
  width: 201%;
  height: 112%;
  top: -1.7%;
  left: -51%;
  object-fit: cover;
  opacity: 0.82;
}

.register-page__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(24, 27, 39, 0.1) 0%,
    rgba(24, 27, 39, 0.5) 50%,
    rgba(24, 27, 39, 0.85) 100%
  );
}

.register-page__content {
  position: relative;
  z-index: 1;
  padding: 0 24px 80px;
}

.register-page__header {
  margin-bottom: 32px;
}

.register-page__title {
  font-family: 'Teko', sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #ffffff;
  line-height: 1;
  text-align: center;
  margin: 0 0 8px;
}

.register-page__subtitle {
  font-family: 'Quantico', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
}

.register-page__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.register-page__divider {
  font-family: 'Quantico', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 4px 0;
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

/* Form */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.register-form__password-wrap {
  position: relative;
}

.register-form__input {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-family: 'Quantico', sans-serif;
  font-size: 15px;
  padding: 0 48px 0 16px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.register-form__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.register-form__input:focus {
  border-color: rgba(255, 255, 255, 0.5);
}

.register-form__input--error {
  border-color: #e63946;
}

.register-form__toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

/* Indicatore forza */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-strength__bar {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.password-strength__fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.2s, background-color 0.2s;
}

.password-strength__fill.weak { background-color: #e63946; }
.password-strength__fill.medium { background-color: #f59e0b; }
.password-strength__fill.strong { background-color: #2ecc71; }

.password-strength__label {
  font-family: 'Quantico', sans-serif;
  font-size: 11px;
  min-width: 40px;
}

.password-strength__label.weak { color: #e63946; }
.password-strength__label.medium { color: #f59e0b; }
.password-strength__label.strong { color: #2ecc71; }

/* Bottone submit */
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
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn--email {
  background-color: #0f3460;
  color: #ffffff;
  font-size: 16px;
}

/* Errore */
.register-page__error {
  font-size: 0.8125rem;
  color: #e63946;
  text-align: center;
  margin: 12px 0 0;
  position: relative;
  z-index: 1;
}

/* Link login */
.register-page__switch {
  font-family: 'Quantico', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 20px 0 32px;
  position: relative;
  z-index: 1;
}

.register-page__switch-link {
  font-weight: 700;
  color: #f59e0b;
  text-decoration: none;
}

/* Footer legale */
.register-page__legal {
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

.register-page__legal-link {
  color: #f59e0b;
  text-decoration: underline;
}
</style>
