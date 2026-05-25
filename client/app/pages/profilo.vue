<template>
  <div class="profile-page">

    <!-- Header -->
    <div class="profile-header">
      <h1 class="profile-header__title">Il Mio Profilo</h1>
      <button class="profile-header__settings" aria-label="Impostazioni">⚙️</button>
    </div>

    <!-- Avatar + info -->
    <div class="profile-hero">
      <div class="profile-avatar">
        <span class="profile-avatar__initials">{{ initials }}</span>
        <div class="profile-avatar__level-badge">{{ user?.level ?? 0 }}</div>
      </div>
      <h2 class="profile-hero__name">{{ user?.username ?? '—' }}</h2>
      <p class="profile-hero__role">{{ levelLabel }} · Livello {{ user?.level ?? 0 }}</p>
    </div>

    <!-- PA Score -->
    <div class="pa-card">
      <p class="pa-card__label">PUNTEGGIO AFFIDABILITÀ</p>
      <div class="pa-card__row">
        <span class="pa-card__score">142</span>
        <span class="pa-card__unit">PA</span>
        <div class="pa-card__bar-wrap">
          <div class="pa-card__bar-track">
            <div class="pa-card__bar-fill" style="width: 71%" />
          </div>
          <p class="pa-card__next">Prossimo livello: 200 PA → Redattore</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stats-row__item">
        <span class="stats-row__value">87</span>
        <span class="stats-row__label">Contributi</span>
      </div>
      <div class="stats-row__item stats-row__item--bordered">
        <span class="stats-row__value">94%</span>
        <span class="stats-row__label">Accuracy</span>
      </div>
      <div class="stats-row__item stats-row__item--bordered">
        <span class="stats-row__value">12</span>
        <span class="stats-row__label">Partite live</span>
      </div>
      <div class="stats-row__item stats-row__item--bordered">
        <span class="stats-row__value">3</span>
        <span class="stats-row__label">Badge</span>
      </div>
    </div>

    <!-- Badges -->
    <section class="section">
      <h3 class="section__title">I MIEI BADGE</h3>
      <div class="badges-grid">
        <div v-for="badge in badges" :key="badge.id"
          class="badge-chip"
          :class="{ 'badge-chip--locked': badge.locked, 'badge-chip--dim': badge.dim }"
        >
          <span class="badge-chip__icon">{{ badge.icon }}</span>
          <span class="badge-chip__name">{{ badge.name }}</span>
          <span v-if="badge.locked" class="badge-chip__lock">🔒</span>
        </div>
      </div>
    </section>

    <!-- Attività recente -->
    <section class="section">
      <h3 class="section__title">ATTIVITÀ RECENTE</h3>
      <div class="activity-list">
        <div v-for="item in recentActivity" :key="item.id" class="activity-item">
          <span class="activity-item__icon">{{ item.icon }}</span>
          <div class="activity-item__body">
            <p class="activity-item__text">{{ item.text }}</p>
            <p class="activity-item__time">{{ item.time }}</p>
          </div>
          <span v-if="item.badge" class="activity-item__badge">{{ item.badge }}</span>
        </div>
      </div>
    </section>

    <!-- Segui -->
    <section class="section section--last">
      <h3 class="section__title">SEGUI</h3>
      <div class="follow-chips">
        <span v-for="tag in following" :key="tag.id" class="follow-chip">
          {{ tag.icon }} {{ tag.name }}
        </span>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const LEVEL_LABELS = ['Spettatore', 'Tifoso', 'Cronista', 'Redattore', 'Verificatore']

const levelLabel = computed(() => LEVEL_LABELS[user.value?.level ?? 0] ?? 'Spettatore')

const initials = computed(() => {
  const name = user.value?.username ?? ''
  return name.slice(0, 2).toUpperCase() || '?'
})

// Placeholder — sostituire con dati reali quando BE espone gli endpoint
const badges = [
  { id: 1, icon: '🏉', name: 'Prima Meta', locked: false, dim: false },
  { id: 2, icon: '📅', name: 'Habitué',    locked: false, dim: false },
  { id: 3, icon: '🎯', name: 'Cecchino',   locked: false, dim: true  },
  { id: 4, icon: '⭐', name: 'Fondatore',  locked: false, dim: false },
  { id: 5, icon: '🏆', name: 'Campione',   locked: true,  dim: true  },
  { id: 6, icon: '🛡️', name: 'Guardiano',  locked: true,  dim: true  },
]

const recentActivity = [
  { id: 1, icon: '🏉', text: 'Inserito: Meta — Rossi M. (Varese vs Brescia)', time: '2 ore fa', badge: '🔵' },
  { id: 2, icon: '💬', text: 'Commento su Rugby Varese vs Brescia',            time: '2 ore fa', badge: null },
  { id: 3, icon: '✅', text: 'Validazione accettata: Meta Moretti S.',         time: 'Ieri',     badge: '✅' },
]

const following = [
  { id: 1, icon: '⚽', name: 'Rugby Varese' },
  { id: 2, icon: '🏆', name: 'Serie C Lomb.' },
  { id: 3, icon: '👤', name: 'L. Bianchi' },
]
</script>

<style scoped>
.profile-page {
  background-color: #121212;
  min-height: 100dvh;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  padding-bottom: 100px;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 56px;
  padding-top: 44px;
  background-color: #121212;
}

.profile-header__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.profile-header__settings {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

/* Hero */
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  padding-bottom: 8px;
}

.profile-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  background-color: #2a2a2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.profile-avatar__initials {
  font-size: 28px;
  font-weight: 700;
  color: #d4a017;
}

.profile-avatar__level-badge {
  position: absolute;
  top: 0;
  right: -4px;
  background-color: #825c02;
  border-radius: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.profile-hero__name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
}

.profile-hero__role {
  font-size: 12px;
  color: #9e9e9e;
  margin: 0;
}

/* PA Card */
.pa-card {
  margin: 16px 16px 0;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 10px 16px 12px;
}

.pa-card__label {
  font-size: 9px;
  font-weight: 700;
  color: #9e9e9e;
  margin: 0 0 4px;
  letter-spacing: 0.5px;
}

.pa-card__row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.pa-card__score {
  font-size: 28px;
  font-weight: 700;
  color: #52b788;
  line-height: 1;
}

.pa-card__unit {
  font-size: 11px;
  font-weight: 500;
  color: #9e9e9e;
  align-self: flex-end;
  margin-bottom: 4px;
}

.pa-card__bar-wrap {
  flex: 1;
  padding-top: 8px;
}

.pa-card__bar-track {
  background-color: #2a2a2a;
  border-radius: 3px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 4px;
}

.pa-card__bar-fill {
  height: 100%;
  background-color: #1a472a;
  border-radius: 3px;
}

.pa-card__next {
  font-size: 10px;
  color: #9e9e9e;
  margin: 0;
  white-space: nowrap;
}

/* Stats */
.stats-row {
  display: flex;
  background-color: #1e1e1e;
  margin-top: 16px;
  height: 72px;
}

.stats-row__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stats-row__item--bordered {
  border-left: 1px solid #333;
}

.stats-row__value {
  font-size: 20px;
  font-weight: 700;
  color: #52b788;
  line-height: 1;
}

.stats-row__label {
  font-size: 9px;
  color: #9e9e9e;
}

/* Sections */
.section {
  padding: 16px 16px 0;
}

.section--last {
  padding-bottom: 16px;
}

.section__title {
  font-size: 10px;
  font-weight: 700;
  color: #9e9e9e;
  margin: 0 0 12px;
  letter-spacing: 0.5px;
}

/* Badges */
.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #182e18;
  border-radius: 10px;
  height: 40px;
  padding: 0 10px;
  min-width: 96px;
}

.badge-chip--dim {
  opacity: 0.4;
}

.badge-chip--locked {
  background-color: #1e1e1e;
  opacity: 0.4;
}

.badge-chip__icon {
  font-size: 16px;
}

.badge-chip__name {
  font-size: 9px;
  font-weight: 600;
  color: #ffffff;
}

.badge-chip__lock {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
}

/* Activity */
.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #262626;
  min-height: 46px;
}

.activity-item__icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.activity-item__body {
  flex: 1;
}

.activity-item__text {
  font-size: 11px;
  color: #ffffff;
  margin: 0 0 4px;
}

.activity-item__time {
  font-size: 9px;
  color: #9e9e9e;
  margin: 0;
}

.activity-item__badge {
  font-size: 10px;
  color: #9e9e9e;
  flex-shrink: 0;
}

/* Follow chips */
.follow-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.follow-chip {
  display: inline-flex;
  align-items: center;
  background-color: #2a2a2a;
  border: 1px solid #333;
  border-radius: 14px;
  height: 28px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 500;
  color: #9e9e9e;
  white-space: nowrap;
}
</style>
