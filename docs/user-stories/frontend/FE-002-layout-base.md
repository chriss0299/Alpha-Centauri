# FE-002 — Layout base: header, nav bottom, footer

**Storia:** Come utente della PWA, voglio trovare una navigazione coerente su ogni pagina, in modo da poter spostarmi rapidamente tra le sezioni principali dell'app senza perdere il contesto.

**Criteri di accettazione:**

### Header
- [ ] Fisso in cima, visibile su tutte le pagine
- [ ] Mostra il logo RugbyTracker (sinistra)
- [ ] Icona notifiche (destra) con badge contatore — placeholder non funzionale in questa task
- [ ] Non si sovrappone al contenuto (padding-top sul body pari all'altezza header)

### Bottom Navigation
- [ ] Fissa in fondo, 5 voci in ordine: **Home · Competizioni · Cerca · Live · Profilo**
- [ ] Ogni voce ha icona + label testuale
- [ ] Voce attiva evidenziata visivamente (colore accent o indicatore)
- [ ] Voce **Profilo** mostra icona utente se autenticato, icona login se non autenticato — routing alla pagina profilo o login di conseguenza
- [ ] Non si sovrappone al contenuto (padding-bottom sul body pari all'altezza bottom nav)

### Footer
- [ ] Visibile solo su viewport ≥ 768px (tablet/desktop)
- [ ] Nascosto su mobile
- [ ] Contenuto minimo: nome app + anno (dettagli da Figma quando disponibile)

### Generale
- [ ] Tutti i componenti vivono nel layout `default.vue` — applicati automaticamente a tutte le pagine
- [ ] Nessuna pagina rompe il layout (niente overflow nascosto che copre la nav)

**Note tecniche:**
- `client/layouts/default.vue` — layout Nuxt con `<slot />` per il contenuto
- Componenti: `AppHeader.vue`, `AppBottomNav.vue`, `AppFooter.vue` in `client/components/`
- Bottom nav usa `useRoute()` per voce attiva, `useRuntimeConfig()` non necessario qui
- Navigazione via `<NuxtLink>` esclusivamente
- Auth-aware: usa Pinia auth store (`isAuthenticated`) — se lo store non esiste ancora, accetta prop booleana temporanea
- Figma di riferimento: https://www.figma.com/design/bVRWy23LoYN5vEoPKGgE5R/progetto-rugby (design in corso — implementare layout strutturale ora, aggiornare stile quando Figma è pronto)
- Palette base già definita: `theme_color: #1a1a2e` (dal PWA manifest)
- Responsive: bottom nav visibile solo `< 768px`; comportamento desktop da definire in task successive

**Dipendenze:** FE-001 (scaffold Nuxt 4)
**Owner:** Sasha (FE)
