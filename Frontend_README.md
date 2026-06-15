# Daily Habits Frontend

Single-Page-Frontend der Daily-Habits-App, gebaut mit Vue 3 und TypeScript. Es zeigt die Challenges aus dem Spring-Boot-Backend an und bietet Anlegen, Bearbeiten, Löschen, Erledigt-Markieren, Kategorie-Filter, zufällige KI-Vorschläge, eine Fortschrittsanzeige und eine Streak-Anzeige.

## Technologie-Stack

- Vue 3 (Composition API, `<script setup>`)
- TypeScript
- Vue Router 5 (eine Route)
- Vite 8 (Build & Dev-Server)
- Vitest 4 + `@vue/test-utils` (Tests, jsdom)
- Bootstrap 5.3 (über CDN in `index.html`) + Bootstrap Icons
- oxlint + ESLint + Prettier

## Projektstruktur

```
src/
  App.vue                     Navbar inkl. Streak-Anzeige + <RouterView>
  main.ts                     Einstiegspunkt
  router/index.ts             Router (Route '/')
  views/HomeView.vue          View, rendert ChallengeList
  components/
    ChallengeList.vue         Zentrale Komponente: Liste, Anlegen, Bearbeiten,
                              Löschen, Toggle, KI-Vorschlag, Fortschritt, Modals
    ChallengeCard.vue         Darstellung einer Challenge + Aktions-Buttons
    CategoryFilter.vue        Kategorie-Auswahl (inkl. "Sozial")
    __tests__/                Komponenten- und Integrationstests
  composables/useStreak.ts    Geteilter Streak-Zustand + Laden von /api/v1/streak
  types/challenge.ts          Geteilte Typen (Challenge, ChallengeSuggestion)
```

## Funktionen (Use-Cases)

- Challenges anzeigen (`GET /api/v1/challenges`)
- Nach Kategorie filtern, inkl. „Sozial" (`GET /api/v1/challenges?category=...`)
- Eigene Challenge anlegen (`POST /api/v1/challenges`)
- Challenge bearbeiten (`PUT /api/v1/challenges/{id}`)
- Challenge löschen (`DELETE /api/v1/challenges/{id}`)
- Als erledigt markieren – optimistisches UI-Update mit Rollback bei Fehler (`PATCH /api/v1/challenges/{id}/toggle`)
- Zufälligen KI-Vorschlag generieren und übernehmen (`GET .../suggestions/random` → `POST /challenges`)
- Fortschrittsanzeige (clientseitig aus den `done`-Werten berechnet)
- Streak-Anzeige (`GET /api/v1/streak`, aktualisiert nach jedem Toggle)

## Backend-Anbindung

Die Backend-URL wird über die Umgebungsvariable `VITE_API_BASE_URL` gesetzt. Ist sie nicht gesetzt, greift der Fallback `https://dailyhabit.onrender.com`. Eine Vorlage liegt in `.env.example`:

```bash
cp .env.example .env
# in .env die eigene Backend-URL eintragen (ohne abschließenden Slash)
```

Damit die Aufrufe im Browser funktionieren, muss das Backend die Origin dieses Frontends in seiner `ALLOWED_ORIGINS`-Variable erlauben (CORS).

## Setup

Voraussetzung: Node.js `^20.19.0 || >=22.12.0`.

```bash
npm install
```

### Entwicklung (Hot-Reload)

```bash
npm run dev
```

### Type-Check, Build (Produktion)

```bash
npm run build
```

### Unit-Tests

```bash
npm run test:unit
```

### Linting / Formatierung

```bash
npm run lint
npm run format
```

## Tests

Die Tests liegen unter `src/components/__tests__/` und mocken `fetch`, sodass kein laufendes Backend nötig ist:

- `ChallengeList.spec.ts` – Laden/Filtern, KI-Vorschlag laden und übernehmen, Toggle (optimistisch), manuelles Anlegen (POST), Bearbeiten (PUT), Löschen (DELETE), Leerzustand, Fehlerpfade und Eingabe-Guards.
- `ChallengeCard.spec.ts` – Emit-Events (toggle/delete/edit), Darstellung erledigter Challenges.
- `CategoryFilter.spec.ts` – Emit, Rendern aller Kategorien inkl. „Sozial", aktives Styling.
- `useStreak.spec.ts` – Streak wird beim Start geladen und nach einem Toggle erneut abgefragt.

## Build und Deployment

Das Frontend ist eine statische SPA. `npm run build` erzeugt das Verzeichnis `dist/`, das z. B. als Static Site auf Render deployt werden kann.

Hinweise für das Deployment:

- `VITE_API_BASE_URL` muss zur **Build-Zeit** gesetzt sein, wenn ein anderes Backend als der Fallback genutzt wird.
- Für das History-Routing (`createWebHistory`) eine Rewrite-Regel `/* → /index.html` einrichten, damit Deep-Links nicht zu 404 führen.
- Im Backend muss die Origin dieses Frontends in `ALLOWED_ORIGINS` stehen.

## GitHub Actions

Der Workflow `.github/workflows/frontend-ci.yml` läuft bei `push` und `pull_request` auf `main`, installiert die Abhängigkeiten (`npm ci`), führt die Tests (`npm run test:unit -- --run`) und anschließend den Build (`npm run build`) aus.
