<template>
  <div class="confirm-page">
    <!-- Sfondo stadio -->
    <div class="confirm-page__bg" aria-hidden="true">
      <img src="/images/login-bg.jpg" alt="" class="confirm-page__bg-img" />
      <div class="confirm-page__bg-overlay" />
    </div>

    <!-- Contenuto -->
    <div class="confirm-page__content">
      <div class="confirm-page__icon">✉️</div>

      <h1 class="confirm-page__title">Controlla la tua email</h1>

      <p class="confirm-page__text">
        Abbiamo inviato un link di conferma a
        <span class="confirm-page__email-wrap"><span class="confirm-page__email">{{ email }}</span>.</span>
        Clicca il link per attivare il tuo account.
      </p>

      <p class="confirm-page__note">
        Non hai ricevuto nulla? Controlla la cartella spam o
        <NuxtLink to="/registrati" class="confirm-page__link">riprova la registrazione</NuxtLink>.
      </p>

      <!-- Dev mode: account già attivo, link diretto -->
      <div v-if="isDev" class="confirm-page__devbox">
        <p class="confirm-page__devbox-label">🛠 Modalità sviluppo</p>
        <p class="confirm-page__devbox-text">
          L'account è già attivo. Le email non vengono inviate in locale.
        </p>
        <NuxtLink :to="`/login`" class="confirm-page__devlink">
          Accedi subito →
        </NuxtLink>
      </div>
    </div>

    <!-- Footer legale -->
    <p class="confirm-page__legal">
      Continuando accetti i <a href="#" class="confirm-page__legal-link">Termini di servizio</a>
      e la <a href="#" class="confirm-page__legal-link">Privacy Policy</a>
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

const route = useRoute()
const email = computed(() => decodeURIComponent((route.query.email as string) ?? ''))
const isDev = import.meta.dev
</script>

<style scoped>
.confirm-page {
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

.confirm-page__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.confirm-page__bg-img {
  position: absolute;
  width: 201%;
  height: 112%;
  top: -1.7%;
  left: -51%;
  object-fit: cover;
  opacity: 0.82;
}

.confirm-page__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(24, 27, 39, 0.1) 0%,
    rgba(24, 27, 39, 0.5) 50%,
    rgba(24, 27, 39, 0.95) 100%
  );
}

.confirm-page__content {
  position: relative;
  z-index: 1;
  padding: 0 24px 80px;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

.confirm-page__icon {
  font-size: 56px;
  margin-bottom: 24px;
  line-height: 1;
}

.confirm-page__title {
  font-family: 'Teko', sans-serif;
  font-weight: 700;
  font-size: 40px;
  color: #ffffff;
  line-height: 1;
  margin: 0 0 20px;
}

.confirm-page__text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin: 0 0 16px;
}

.confirm-page__email-wrap {
  display: inline-block;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.85);
}

.confirm-page__email {
  color: #f59e0b;
  font-weight: 700;
}

.confirm-page__note {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 32px;
  line-height: 1.5;
}

.confirm-page__link {
  color: #f59e0b;
  font-weight: 700;
  text-decoration: none;
}

/* Dev box */
.confirm-page__devbox {
  background-color: rgba(212, 160, 23, 0.12);
  border: 1.5px solid rgba(212, 160, 23, 0.4);
  border-radius: 14px;
  padding: 16px 20px;
  text-align: left;
}

.confirm-page__devbox-label {
  font-size: 12px;
  font-weight: 700;
  color: #d4a017;
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.confirm-page__devbox-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 14px;
  line-height: 1.5;
}

.confirm-page__devlink {
  display: inline-block;
  background-color: #d4a017;
  color: #000000;
  font-family: 'Quantico', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.confirm-page__devlink:hover {
  opacity: 0.85;
}

/* Footer legale */
.confirm-page__legal {
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

.confirm-page__legal-link {
  color: #f59e0b;
  text-decoration: underline;
}
</style>
