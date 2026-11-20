# Arkitektur

Gäller **Fas 1 - Grund + landningssida**. Källa: `PROMPT-grannbo.md` (specen),
`docs/plan.md` (uppgifterna 1.1-1.24 och 1.5b) och `docs/decisions.md` (A1–A13 och F1–F8).
Faserna 2-6 får egna avsnitt först när de planeras.

## 0. Läsanvisning och spelregler för byggaren

- Allt som står här är bindande. Ett fall som varken specen eller den här filen
  avgör (en text, en statuskod, ett klassnamn som syns i ett test, ett
  filnamn) lämnas tillbaka till arkitekten **innan** ett test skrivs för det.
  Ett "eget val" i en redovisning räknas som ett öppet hål.
- Varje kommando i den här filen har ett id (K1, K2 ...). Om ett kommando är
  kört eller inte står **bara** i tabellen i avsnitt 12 ("Verifieringsstatus").
  När ett kommando har körts skrivs raden där om till dåtid med utfallet, och
  ingen annan rad i filen ändras för det.
- Varje körning som redovisas har en yttre tidsgräns (`timeout <sekunder>` i
  Git Bash) och redovisas med sista resultatraden och exitkoden ordagrant. Det
  är den sista körningen som redovisas.
- Antal skrivs bara när specen själv anger dem.
- Strängar som kod producerar och som innehåller U+2013 (tankstreck), U+00A0
  eller U+2212 skrivs med escape (`\u2013`, `\u00a0`, `\u2212`) i TS-källan och
  i testernas förväntade värden, aldrig som det råa tecknet.

## 1. Mappstruktur

```
/                              Monorepo-rot
├─ .gitattributes              Radslut LF för text, binärmarkering för media och typsnitt (1.2)
├─ .gitignore                  Se avsnitt 10 (1.2)
├─ .env.example                Bara variabelnamn och platshållare (1.2)
├─ docker-compose.yml          PostgreSQL + API (1.4, inte tidigare)
├─ README.md                   Stomme i 1.1, Fas 1-innehåll i 1.24
├─ .github/
│  └─ workflows/
│     └─ ci.yml                Jobben api och web (1.6)
├─ .scratch/                   Utredningsskript. Ignorerad, checkas aldrig in (1.2)
├─ api/                        ASP.NET Core-lösningen
│  ├─ Grannbo.slnx             Lösningsfil (SLNX-format)
│  ├─ global.json              SDK-spärr: 10.0.x
│  ├─ Directory.Build.props    Gemensamma MSBuild-egenskaper för alla projekt
│  ├─ Directory.Packages.props Central paketversionshantering (alla NuGet-versioner står här)
│  ├─ .editorconfig            Kodstil för dotnet format
│  ├─ .dockerignore
│  ├─ Dockerfile               Bygger och kör Grannbo.Api (bygg-kontext: api/)
│  ├─ src/
│  │  ├─ Grannbo.Domain/            Domänmodell. Inga referenser. Inga källfiler i Fas 1
│  │  ├─ Grannbo.Application/       Användningsfall. Refererar Domain. Inga källfiler i Fas 1
│  │  ├─ Grannbo.Infrastructure/    EF Core, Npgsql m.m. från Fas 2. Refererar Application. Inga källfiler i Fas 1
│  │  └─ Grannbo.Api/               Webbvärd och kompositionsrot. Refererar Application och Infrastructure
│  │     ├─ Program.cs
│  │     ├─ ProblemTexts.cs     Svenska titlar för 404 och 500 (5.2)
│  │     ├─ appsettings.json
│  │     ├─ appsettings.Development.json
│  │     └─ Properties/launchSettings.json
│  └─ tests/
│     └─ Grannbo.Api.Tests/         xUnit: hälsa, ProblemDetails, projektreferenser
│        ├─ GrannboApiFactory.cs
│        ├─ HealthEndpointTests.cs
│        ├─ ProblemDetailsTests.cs
│        └─ ProjectReferenceTests.cs
├─ web/                        React-webbapp (landningssida i Fas 1)
│  ├─ .nvmrc                   "24"
│  ├─ index.html               Meta, SEO, Open Graph, favicon, preload av poster
│  ├─ package.json / package-lock.json
│  ├─ vite.config.ts           Vite + React + Tailwind-plugin + Vitest-konfig (test-blocket)
│  ├─ tsconfig.json, tsconfig.app.json, tsconfig.node.json
│  ├─ tsconfig.test.json       Typkontroll av tests/ och e2e/ (1.7, innehåll i 5.1)
│  ├─ eslint.config.js         ESLint flat config (TS/React-regler för .ts/.tsx, Node-regler för .js/.mjs)
│  ├─ .prettierrc.json, .prettierignore
│  ├─ playwright.config.ts     Konfig för e2e/ (1.22). Paketet installeras redan i 1.8
│  ├─ public/
│  │  ├─ favicon.svg
│  │  ├─ robots.txt
│  │  └─ media/
│  │     ├─ hero-drone.webm
│  │     ├─ hero-drone.mp4
│  │     ├─ hero-poster.jpg
│  │     ├─ og-image.jpg
│  │     └─ premises/            laundry|sauna|party-room - 480|800|1200 . avif|webp|jpg
│  ├─ media-src/               Källor för egenproducerade platshållare (SVG). Serveras inte
│  ├─ scripts/
│  │  ├─ lighthouse.mjs        Kör Lighthouse mot produktionsbygget (1.23)
│  │  └─ media/
│  │     ├─ make-placeholders.mjs  Skapar all platshållarmedia med ffmpeg-static (1.12, 1.14, 1.21)
│  │     └─ README.md          Körda kommandon och utdata
│  ├─ e2e/
│  │  └─ responsive.spec.ts    375/768/1440 px (1.22)
│  ├─ tests/                   Repo-nivåtester som läser filer (miljö per fil, se reglerna nedan)
│  │  ├─ support/contrast.ts
│  │  ├─ support/contentGuard.ts
│  │  ├─ tokens-contrast.test.ts      (1.7, node)
│  │  ├─ logo-colors.test.ts          (1.8, node: bara filinnehåll, ingen rendering)
│  │  ├─ media-files.test.ts          (1.12, utökas i 1.14 och 1.21, node)
│  │  ├─ media-credits.test.ts        (1.20, node)
│  │  ├─ seo-meta.test.ts             (1.21, jsdom: tolkar index.html med DOMParser)
│  │  └─ content-guard.test.ts        (1.21, node)
│  └─ src/
│     ├─ main.tsx              Monterar <App/>, importerar styles/index.css
│     ├─ App.tsx               RouterProvider med routerna i avsnitt 5.6
│     ├─ styles/
│     │  ├─ index.css          @import 'tailwindcss'; tokens; typsnitt; bas-stilar
│     │  └─ tokens.css         @theme-blocket: ALLA design tokens (avsnitt 4)
│     ├─ lib/
│     │  └─ cn.ts              Slår ihop klassnamn (ersätter clsx)
│     ├─ test/
│     │  └─ setup.ts           Bara jest-dom (5.1). Stubbar för matchMedia/IntersectionObserver ligger i testfilerna som behöver dem
│     ├─ components/
│     │  ├─ ui/                Komponentbiblioteket (avsnitt 6). Varje komponent + egen *.test.tsx
│     │  ├─ brand/Logo.tsx     Logotypen som SVG (1.8)
│     │  ├─ brand/Logo.test.tsx  Renderingstest för Logo (1.8, jsdom)
│     │  ├─ icons/             Egenritade ikoner som TSX (steg, chevron, stäng, paus, spela)
│     │  ├─ media/ResponsiveImage.tsx   <picture> med AVIF/WebP/JPEG och srcset
│     │  └─ layout/
│     │     ├─ SiteHeader.tsx  Logotyp + hoppa-till-innehåll-länk
│     │     └─ SiteFooter.tsx  Footern (landningssidans sektion 8, används på alla sidor)
│     └─ features/
│        ├─ landing/
│        │  ├─ LandingPage.tsx
│        │  ├─ LazySection.tsx
│        │  ├─ heroMedia.ts    getHeroMediaMode, isSlowConnection, useHeroMediaMode
│        │  ├─ content.ts      ALLA texter på landningssidan (avsnitt 7)
│        │  └─ sections/
│        │     ├─ Hero.tsx
│        │     ├─ HowItWorks.tsx
│        │     ├─ Premises.tsx
│        │     ├─ ForBoard.tsx
│        │     ├─ MobileApp.tsx
│        │     ├─ Pricing.tsx
│        │     └─ Faq.tsx
│        ├─ legal/PrivacyPage.tsx
│        ├─ demo/DemoPlaceholderPage.tsx
│        └─ errors/NotFoundPage.tsx
├─ mobile/
│  └─ README.md                Bara README i Fas 1 (A7)
└─ docs/
   ├─ ARKITEKTUR.md            Den här filen
   ├─ plan.md
   ├─ decisions.md             Beslut/ADR-logg (A*, F*)
   ├─ media-credits.md         Licens och källa per mediafil och typsnitt (1.20)
   └─ brand/
      ├─ logo-source.pdf       Oförändrad kopia av logotypens PDF; den inbäddade bilden är facit för formen (1.8)
      └─ logo-source.png       Oförändrad kopia av logotypens PNG (färgkontroll, 1.8)
```

Regler för strukturen:

- Komponenttester ligger bredvid komponenten (`Button.tsx` + `Button.test.tsx`)
  och körs i standardmiljön `jsdom`.
- Tester som läser filer från disk ligger i `web/tests/`. Undantag: ett
  komponenttest som behöver en fils innehåll läser den med Vites `?raw`-import
  (inte `node:fs`) och ligger då intill komponenten i jsdom-miljön; i Fas 1
  gäller det bara `Logo.test.tsx` (4.5). Kommentaren
  `// @vitest-environment node` får bara stå överst i en testfil som varken
  renderar en komponent eller använder DOM-API:er; miljön per fil står i
  trädet ovan. Ett test som renderar en komponent är en `.tsx`-fil i
  `jsdom`-miljön.
- `docker-compose.yml` skapas i 1.4, inte i 1.1.
- `mobile/README.md` innehåller exakt: en rubrik `# Grannbo mobil` och meningen
  `Expo-appen (React Native, TypeScript, Expo Router, Expo Notifications) byggs i Fas 5. Se docs/plan.md.`
- `docs/brand/logo-source.pdf` är en byte-identisk kopia av `K4 · Rutnätet.pdf`
  och `docs/brand/logo-source.png` av `K4 · Rutnätet@1x.png`, båda på
  användarens skrivbord. Filnamnen i repot är ASCII för att undvika problem med
  `·` och mellanslag. 1.8 redovisar `Get-FileHash` (SHA256) för källfil och kopia,
  för båda filerna. Ingen lokal sökväg med användarnamn skrivs i någon fil i
  repot.

## 2. Teknikval

| Val | Varför | Vad vi valde bort |
|-----|--------|-------------------|
| .NET 10, `net10.0`, SDK spärrad med `global.json` `{"sdk":{"version":"10.0.100","rollForward":"latestFeature"}}` | Specen (avsnitt 1). SDK 10.0.302 finns lokalt. `10.0.100` + `latestFeature` låter lokal SDK, CI (`10.0.x`) och Docker-avbildningen `sdk:10.0` alla matcha utan att låsa en exakt patch. | Exakt `10.0.302` i global.json: Docker-avbildningen och CI kan ha en annan patch och skulle då vägra bygga. |
| Lösningsfil `Grannbo.slnx` | SLNX är standardformatet i .NET 10-SDK:n och går att läsa i diffar. | `.sln`. |
| Central paketversionshantering (`Directory.Packages.props`) + `RestorePackagesWithLockFile=true` | En plats för alla NuGet-versioner. `packages.lock.json` per projekt låser exakta versioner; CI kör `--locked-mode`. | Versioner per csproj. |
| `Serilog.AspNetCore` (enda loggpaketet) | Specen kräver Serilog. Paketet innehåller konsol-sink, konfigurationsläsning och request-loggning. | Fler sinks (Seq, fil): inget krav i Fas 1. |
| Inbyggt `AddProblemDetails` (med `CustomizeProblemDetails`, 5.2) + `UseExceptionHandler` + `UseStatusCodePages` | Specen kräver ProblemDetails. Finns i ramverket, inget paket. | Hellang.Middleware.ProblemDetails. |
| Inbyggda hälsokontroller (`AddHealthChecks`, `MapHealthChecks`) | Finns i ASP.NET Core. Fas 1 har ingen databaskoppling, så bara liveness. | AspNetCore.HealthChecks.NpgSql: läggs till i Fas 2 när API:t pratar med databasen. |
| Tester: `xunit.v3.mtp-off`, `xunit.runner.visualstudio`, `Microsoft.NET.Test.Sdk`, `Microsoft.AspNetCore.Mvc.Testing` | Specen kräver xUnit. `xunit.v3.mtp-off` är senaste xUnit v3 utan Microsoft.Testing.Platform v2, så att `dotnet test` (K6) körs i VSTest-läge (D37). `WebApplicationFactory` testar API:t i minnet utan nätverk eller databas. | `xunit.v3` (drar in MTP v2, och `dotnet test` vägrar köra, D37). `xunit.v3` 3.2.2 (äldre major). `global.json` med `test.runner` = `Microsoft.Testing.Platform` (oprovad). Testcontainers i Fas 1: ingen databas används ännu. Kommer i Fas 2. |
| Kodstil api: `dotnet format` + `TreatWarningsAsErrors=true`, regler i `api/.editorconfig` (5.2) | Ingår i SDK:n. `.editorconfig` sätter LF, så att `dotnet format` och `.gitattributes` kräver samma radslut (D38). | StyleCop, andra analyspaket. |
| Docker-avbildningar `mcr.microsoft.com/dotnet/sdk:10.0`, `mcr.microsoft.com/dotnet/aspnet:10.0`, `postgres:17-alpine` | Officiella avbildningar. Postgres 17 har den välkända datakatalogen `/var/lib/postgresql/data`; 18 ändrade volymsökvägen. | `postgres:18`, `latest`-taggar. |
| Node 24 (`web/.nvmrc` = `24`), npm 11, `package-lock.json` | Verifierat lokalt (v24.19.0, npm 11.17.0). Lockfilen låser alla exakta versioner; CI kör `npm ci`. | yarn, pnpm. |
| React (≥ 19) + TypeScript **6.0.3** (D40) + Vite, `@vitejs/plugin-react`, `@types/node` exakt version inom **^24** (D41) | Specen. React 19 kan rendera `<title>` i komponenter, så ingen helmet-modul behövs. | Next.js, CRA. |
| Tailwind CSS 4 via `@tailwindcss/vite`; tokens i ett `@theme`-block i `web/src/styles/tokens.css` | Specen kräver tokens "i Tailwind-konfigen". I Tailwind 4 *är* `@theme` konfigurationen; ingen `tailwind.config.js` behövs. | Tailwind 3 med `tailwind.config.ts` (äldre major). PostCSS-uppsättning. |
| React Router (≥ 7), `createBrowserRouter` | Specen. Fas 1 behöver riktiga sidor för integritetspolicy, demo-platshållare och 404, eftersom footerns länkar ska gå till sidor som finns. | Egen routing, flersides-Vite. |
| TanStack Query: **installeras inte i Fas 1** | Landningssidan gör inga API-anrop. Installeras i den fas där första anropet görs. | Installera nu "för framtiden". |
| Framer Motion: **installeras inte i Fas 1** | Animationerna i Fas 1 (toast in/ut, skeleton-puls) klaras med CSS och `motion-safe:`/`motion-reduce:`. När biblioteket behövs installeras paketet `motion` (det nya namnet på Framer Motion, import från `motion/react`). | Installera nu. |
| ESLint (flat config) `eslint` och `@eslint/js` **9.39.5** (D39) med `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`, `globals`, `eslint-config-prettier` | Vites mall + jsx-a11y, som fångar saknad alt-text, felaktiga ARIA-attribut och fokusfel redan i lint. Specen kräver WCAG AA. | Ingen a11y-lint (fel hittas först i Lighthouse). |
| Prettier 3 | Formatering, kontrolleras i CI med `--check`. | - |
| Vitest + `jsdom` + `@testing-library/react` + `@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom` | Specen. | Jest. |
| `@playwright/test` (devDependency, installeras i 1.8), bara lokalt i Fas 1 | Används till: logojämförelsen i 1.8, rastring av SVG i medieskriptet (1.14, 1.21) och responsivitetskontrollen i 1.22. Det enda pålitliga sättet att mäta "ingen vågrät rullning" i en riktig webbläsare vid 375/768/1440 px och ta helsidesbilder per bredd. Används med `channel: 'chrome'` (Chrome finns, K19). | Manuell kontroll i DevTools (går inte att upprepa eller granska). Playwright i CI (ökar CI-tiden och kräver webbläsarinstallation; tas upp i Fas 4). |
| `lighthouse` (devDependency) | Specens klarkriterium. Som devDependency blir versionen låst i lockfilen och mätningen går att upprepa. | `npx lighthouse@latest` (olåst version), PageSpeed Insights (kräver publicerad sida). |
| Typsnitt: Fraunces (rubriker) via `@fontsource-variable/fraunces` och Inter (brödtext) via `@fontsource-variable/inter` (F5) | A2: självhostat, inget hämtas från tredje part. Båda är OFL, som uttryckligen tillåter spridning. Fontsource-paketen buntas av Vite och serveras från samma origin. | Google Fonts-CDN. Typsnitt som inte är OFL (F5). |
| Ikoner: egenritade SVG-komponenter | Ikonerna som behövs är enkla (uppräknade i avsnitt 1 under `components/icons/`). Inget beroende, ingen licensfråga. | lucide-react m.fl. |
| `cn()` i `src/lib/cn.ts` | En rad, ersätter `clsx`. | clsx, tailwind-merge. |
| `ffmpeg-static` (devDependency) | ffmpeg finns inte i systemet (K18), och ingen programvara installeras i systemet (F7). Paketet levererar en ffmpeg-binär via npm, låst i lockfilen. Skapar platshållarvideo, poster och bildformat (AVIF/WebP/JPEG). Ett verktyg för all media. | ffmpeg installerat i systemet (F7). sharp (täcker inte video). |

**Versioner.** Det enda arkitekten kan stå för är det som verifierats lokalt:
.NET SDK 10.0.302, Node v24.19.0, npm 11.17.0 (avsnitt 12). Major-versionerna
ovan ("≥ 19", "4", "≥ 7", "3") är minimikrav. Byggaren installerar senaste
stabila version av varje paket när paketet läggs till, med undantag för de
låsningar som står i D-posterna (D37 `xunit.v3.mtp-off`, D39 ESLint 9.39.5,
D40 TypeScript 6.0.3, D41 `@types/node` exakt inom ^24). Ingen `--legacy-peer-deps`.
Alla npm-paket installeras med `--save-exact`, så att `package.json`
anger exakta versioner (inga `^` eller `~`). Byggaren låser versionen via
`package-lock.json` respektive `packages.lock.json`, och redovisar de faktiska
versionerna (utdrag ur `npm ls --depth=0` och `Directory.Packages.props`) i
redovisningen för 1.3 och 1.5. Ingen version skrivs in i README förrän den är
låst.

## 3. Datamodell

Fas 1 har ingen databasmodell (den kommer i Fas 2). Datamodellen i Fas 1 är
innehållet på landningssidan, tokenfilen och miljövariablerna.

### 3.1 Innehållstyper (`web/src/features/landing/content.ts`)

```ts
export type SectionId =
  | 'sa-fungerar-det'
  | 'lokalerna'
  | 'for-styrelsen'
  | 'mobilappen'
  | 'prisplan'
  | 'vanliga-fragor';

export interface Step {          // alla fält obligatoriska
  title: string;
  text: string;
  icon: 'bankid-login' | 'choose-premise' | 'book';   // egenritade ikoner, ingen BankID-logotyp
}

export type PremiseId = 'laundry' | 'sauna' | 'party-room';

export interface PremiseRule {   // alla fält obligatoriska
  label: 'Pass' | 'Kvot' | 'Bokningsfönster' | 'Avbokning' | 'Special';
  value: string;
}

export interface Premise {       // alla fält obligatoriska
  id: PremiseId;
  name: string;
  imageBasePath: string;         // '/media/premises/laundry' osv.
  imageAlt: string;
  rules: readonly PremiseRule[]; // i ordningen Pass, Kvot, Bokningsfönster, Avbokning, Special
}

export interface PricingTier {   // alla fält obligatoriska; innehåll i 7.6
  name: 'Bas' | 'Förening' | 'Fastighetsägare';
  price: string;
  features: readonly string[];
}

export interface FaqItem {       // alla fält obligatoriska
  id: string;                    // ASCII, kebab-case
  question: string;
  answer: string;
}

export interface NotificationExample { // alla fält obligatoriska
  title: 'Grannbo';
  body: string;
}
```

`content.ts` exporterar konstanterna `HERO`, `STEPS`, `PREMISES`, `FOR_BOARD`,
`MOBILE_APP`, `PRICING`, `FAQ`, `FOOTER`, `PRIVACY` och `SECTION_IDS`, alla
`as const`. Sektionskomponenterna hämtar all synlig text härifrån. Texterna står
ordagrant i avsnitt 7. Testerna skriver de förväntade texterna som litteraler i
testfilen och importerar dem **inte** från `content.ts` (annars testar testet
sig självt).

### 3.2 Tokenfilen

`web/src/styles/tokens.css` innehåller ett `@theme`-block. Färger skrivs bara som
`--color-<namn>: #RRGGBB;` eller, för overlay, `--color-<namn>: rgb(R G B / A);`
med heltal och en decimal för A. Testet i 1.7 tolkar exakt de formerna och
faller på varje annan form av en `--color-`-rad.

### 3.3 Miljövariabler (`.env.example` i roten)

| Namn | Obligatorisk | Läses av | Platshållare i `.env.example` |
|------|--------------|----------|-------------------------------|
| `POSTGRES_USER` | ja | db-tjänsten i Compose | `grannbo` |
| `POSTGRES_PASSWORD` | ja | db-tjänsten i Compose | `byt-mig` |
| `POSTGRES_DB` | ja | db-tjänsten i Compose | `grannbo` |
| `POSTGRES_PORT` | nej (standard 5432) | port på värden för db | `5432` |
| `API_PORT` | nej (standard 8080) | port på värden för api | `8080` |
| `ASPNETCORE_ENVIRONMENT` | nej (standard `Development`) | api-tjänsten | `Development` |

Webben läser inga miljövariabler i Fas 1. API:t läser ingen anslutningssträng i
Fas 1. Varje variabel som någon kod eller Compose-filen läser ska stå i tabellen
och i `.env.example`; en ny variabel läggs till här först.

## 4. Design tokens

### 4.1 Färger (`--color-*`)

Standardpaletten nollställs med `--color-*: initial;` först i `@theme`, så att
bara tokens nedan finns som färgklasser.

Basvärdena är uppmätta i logotypens PNG (pixelräkning av koordinatorn, A1):
nattblå `#1B2A41`, orange `#E38B5C`, neutral ljus `#C9D2DE`, bakgrund
`#F4F6F9` och sekundär text `#475569`. Varje skala utgår från sitt basvärde
(markerat **bas**); övriga steg är härledda av arkitekten. Bara steg som har en
användning nedan finns som token. Ett nytt steg (t.ex. `primary-500`) läggs
till här först, med sin användning, när en komponent behöver det.

| Token | Värde | Användning |
|-------|-------|------------|
| `primary-900` | `#1B2A41` **bas** | Primärfärg (logotypen). Rubriker, brödtext, primärknapp, footer-bakgrund, fokusring på ljus botten |
| `primary-800` | `#273A58` | Primärknappens hover |
| `primary-100` | `#E2E7EF` | Badge `neutral`, illustrationsytor, skeleton |
| `accent-500` | `#E38B5C` **bas** | Accentfärg (logotypen). Se regeln under tabellen |
| `accent-700` | `#9A4A28` | Accent som text och meningsbärande ikon på ljus botten |
| `accent-100` | `#FBEAE0` | Badge `accent` |
| `neutral-50` | `#F4F6F9` **bas** | Sidans bakgrund |
| `neutral-300` | `#C9D2DE` **bas** | Dekorativa avdelare och kortkanter (logotypens ljusgrå ruta), sekundär text på primary-900 |
| `neutral-500` | `#7A8399` | Kantlinje för Input (icke-text, 3:1) |
| `neutral-600` | `#475569` **bas** | Sekundär text på ljus botten |
| `white` | `#FFFFFF` | Kortytor, text på primary-900 |
| `success-700` | `#2E6B3F` | Toast `success` text/ikon |
| `success-100` | `#E3F1E6` | Toast `success` yta |
| `danger-700` | `#B3261E` | Felmeddelanden i Input, Toast `error` |
| `danger-100` | `#FBE4E2` | Toast `error` yta |
| `overlay` | `rgb(27 42 65 / 0.7)` | Herons gradient, ljusaste punkten |
| `overlay-strong` | `rgb(27 42 65 / 0.85)` | Herons gradient, mörkaste punkten |

**Regel för `accent-500` (`#E38B5C`).** Klarar inte AA som text på ljus botten.
Den får användas: som yta med `primary-900`-text (par T7); i logotypen; som
dekorativ yta eller dekorativ ikon (`aria-hidden`, bär ingen information); och
som text, ikon eller fokusring på `primary-900` (par T19, N4). Den får **inte**
användas som text i någon storlek, eller som meningsbärande ikon, på
`neutral-50` eller `white`. Där används `accent-700`. Skäl (A11): stor text
kräver 3:1 (WCAG 1.4.3) och meningsbärande ikoner 3:1 (WCAG 1.4.11), och
`#E38B5C` mot `#F4F6F9` ger 2.39 (avsnitt 12). Paret X1 i 4.2 är testets belägg
för det.

Bakgrunden är logotypens `#F4F6F9`, inte en varm off-white som specen
(avsnitt 6) föreslår: användaren har bestämt att logotypens färger går före
specen här (A1). Herons gradient går från `overlay` till `overlay-strong`, så
ingen punkt bakom heron-texten är ljusare än `overlay`.

De uträknade kvoterna för logotypens basfärger och `accent-700` står i avsnitt
12. Övriga steg (`primary-800`, `primary-100`, `accent-100`, `neutral-500`,
`success-*`, `danger-*`, overlay) är valda av arkitekten med marginal men inte
uträknade. Facit för alla par är testet i 1.7. Klarar ett par inte kravet ändrar
byggaren **inte** färgen själv utan lämnar tillbaka till arkitekten.

### 4.2 Kontrastpar som testet i 1.7 kräver

Formeln är WCAG 2.x (relativ luminans, sRGB-linearisering med 0,04045, kvot
`(L1 + 0,05) / (L2 + 0,05)`). Testet jämför det oavrundade talet med gränsen och
skriver ut kvoten med sex decimaler i testnamnet eller assert-meddelandet.

Text, krav ≥ 4,5:1:

| # | Förgrund | Bakgrund | Var |
|---|----------|----------|-----|
| T1 | primary-900 | neutral-50 | Brödtext, rubriker |
| T2 | primary-900 | white | Text i kort |
| T3 | neutral-600 | neutral-50 | Sekundär text |
| T4 | neutral-600 | white | Sekundär text i kort |
| T5 | white | primary-900 | Primärknapp, footer |
| T6 | white | primary-800 | Primärknapp hover |
| T7 | primary-900 | accent-500 | Accentknapp |
| T8 | accent-700 | neutral-50 | Accenttext |
| T9 | accent-700 | white | Accenttext i kort |
| T10 | accent-700 | accent-100 | Badge accent |
| T11 | primary-900 | primary-100 | Badge neutral, illustrationer |
| T12 | neutral-300 | primary-900 | Sekundär text i footern |
| T13 | danger-700 | neutral-50 | Fel under Input |
| T14 | danger-700 | white | Fel under Input i kort |
| T15 | danger-700 | danger-100 | Toast error |
| T16 | success-700 | success-100 | Toast success |
| T17 | primary-900 | white | Toast info (samma som T2, egen rad för spårbarhet) |
| T18 | white | `overlay` komponerad över `#FFFFFF` | Heron-text i värsta fall (vit videobild bakom overlay) |
| T19 | accent-500 | primary-900 | Accenttext och accentikoner på mörk botten (footer) |

Dokumenterat underkänt par, krav **< 3:1** (testet visar att regeln för
`accent-500` i 4.1 behövs):

| # | Förgrund | Bakgrund | Var |
|---|----------|----------|-----|
| X1 | accent-500 | neutral-50 | Förbjuden användning: orange text eller meningsbärande ikon på sidans bakgrund |

Icke-text (WCAG 1.4.11), krav ≥ 3:1:

| # | Förgrund | Bakgrund | Var |
|---|----------|----------|-----|
| N1 | neutral-500 | white | Input-kant |
| N2 | neutral-500 | neutral-50 | Input-kant |
| N3 | primary-900 | neutral-50 | Fokusring på ljus botten |
| N4 | accent-500 | primary-900 | Fokusring på mörk botten (footer) |
| N5 | white | `overlay` komponerad över `#FFFFFF` | Fokusring och knappkant i heron |

Testet faller också om en token som paret namnger saknas i `tokens.css`, och
`web/tests/support/contrast.ts` har egna tester: svart mot vitt ger exakt 21,
samma färg mot sig själv ger exakt 1.

```ts
// web/tests/support/contrast.ts
export type Rgb = { r: number; g: number; b: number };        // 0-255
export function parseHex(hex: string): Rgb;                    // '#RRGGBB', kastar annars
export function parseRgba(value: string): Rgb & { a: number }; // 'rgb(R G B / A)', kastar annars
export function composite(top: Rgb & { a: number }, bottom: Rgb): Rgb;
export function relativeLuminance(color: Rgb): number;
export function contrastRatio(a: Rgb, b: Rgb): number;
export function readColorTokens(cssText: string): Map<string, string>; // 'primary-900' -> '#1B2A41'
```

### 4.3 Typsnitt (`--font-*`, nollställs med `--font-*: initial;`)

| Token | Värde | Användning |
|-------|-------|------------|
| `--font-heading` | `"Fraunces Variable", ui-serif, Georgia, serif` | h1-h3, logotypens ordmärke, prisnivåer |
| `--font-body` | `"Inter Variable", ui-sans-serif, system-ui, sans-serif` | All annan text |

- I `main.tsx`: `import '@fontsource-variable/fraunces';` och
  `import '@fontsource-variable/inter';`. Inga egna `@font-face` och inga
  typsnittsfiler i `src/`.
- Typsnittsnamnen ovan (`Fraunces Variable`, `Inter Variable`) ska stämma med
  `font-family` i paketens CSS. Byggaren kontrollerar det i
  `node_modules/@fontsource-variable/*/index.css` i 1.7 och redovisar raden.
  Skiljer de sig lämnas det tillbaka till arkitekten.
- Inga `<link>` till externa typsnittsvärdar. Testet i 1.7 söker i `index.html`
  och `src/**/*.css` efter `fonts.googleapis` och `fonts.gstatic`
  (skiftlägesokänsligt) och kräver noll träffar.
- Typsnittens licens står under rubriken `## Typsnitt` i `docs/media-credits.md`.

Rubrikskala (Tailwinds standardstorlekar, mobil först):

| Element | Klasser |
|---------|---------|
| h1 (bara heron) | `font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight` |
| h2 (sektionsrubrik) | `font-heading text-3xl md:text-4xl font-semibold tracking-tight` |
| h3 | `font-heading text-xl font-semibold` |
| Brödtext | `font-body text-base md:text-lg` (ingress), `text-base` (övrigt) |

### 4.4 Avstånd, bredd, radier och skuggor

- Avstånd: Tailwinds standardskala (`--spacing: 0.25rem`) behålls. Sektioner
  använder `py-16 md:py-24`, sidmarginal `px-5 md:px-8`.
- `--container-content: 72rem` (klassen `max-w-content`) för allt innehåll.
- Brytpunkter: Tailwinds standard (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).
- Radier (nollställs med `--radius-*: initial;`):
  `--radius-sm: 0.375rem` (Badge), `--radius-md: 0.625rem` (Button, Input),
  `--radius-lg: 1rem` (Card, Toast), `--radius-xl: 1.5rem` (illustrationer,
  telefonmockup). `rounded-full` är statisk i Tailwind 4 och finns kvar.
- Skuggor (nollställs med `--shadow-*: initial;`):
  `--shadow-sm: 0 1px 2px rgb(27 42 65 / 0.06)`,
  `--shadow-md: 0 4px 16px -4px rgb(27 42 65 / 0.12)`,
  `--shadow-lg: 0 16px 40px -12px rgb(27 42 65 / 0.2)`
  (`rgb(27 42 65)` är `primary-900`, `#1B2A41`).
- Fokus: alla interaktiva element har
  `focus-visible:outline-2 focus-visible:outline-offset-2` med
  `outline-primary-900` på ljus botten och `outline-accent-500` på mörk botten
  (footer) eller `outline-white` i heron.

### 4.5 Logotyp och favicon (1.8)

- Källor (F2, A13): det finns ingen vektorkälla. `docs/brand/logo-source.pdf`
  innehåller bara en inbäddad JPEG-bild som täcker hela sidan och inga banor
  (koordinatorns kontroll 2026-11-20). Den inbäddade JPEG:en är samma logotyp i
  högre upplösning än PNG:n och är facit för formen: proportioner, rutor,
  mellanrum, hörnradier, husets form, ringarna och hur raderna och kolumnerna
  ligger. `docs/brand/logo-source.png` är facit för färgerna.
- Mätning i 1.8: byggaren extraherar den inbäddade JPEG:en ur PDF:en med ett
  skript i `.scratch/logo/` (bytena från `FF D8` till och med `FF D9` i
  PDF:ens bildström) till `.scratch/logo/logo-source-embedded.jpg`, redovisar
  bildens mått med kommandot som läste dem, och mäter i den bilden, i pixlar:
  varje ruta (x, y, bredd, höjd, hörnradie), mellanrummen, husets hörnpunkter
  och ringarnas läge och storlek. Måtten redovisas som en tabell i 1.8, och
  SVG:ns `viewBox` och koordinater räknas fram ur dem (skalan redovisas).
  Måtten i tabellen är facit för SVG:n; de uppskattas inte på fri hand. Motivet: en
  kalender som ett rutnät 3×4 med två ringar upptill, ett orange hus i rad 2,
  kolumn 2, en ljusgrå ruta längst ned till höger, övriga rutor nattblå;
  ordmärket "Grannbo" och taglinen "Bokningssystem för fastigheter och
  föreningar".
- `web/src/components/brand/Logo.tsx`:

```ts
export interface LogoProps {
  variant?: 'full' | 'mark';      // standard 'full': märke + ordmärket "Grannbo"
  tone?: 'onLight' | 'onDark';    // standard 'onLight'
  withTagline?: boolean;          // standard false; bara variant 'full'
  className?: string;
}
export function Logo(props: LogoProps): JSX.Element;
```

  Märket är en inline-SVG med `role="img"` och `<title>Grannbo</title>`
  (kopplad med `aria-labelledby` till ett `useId`-id). Ordmärke och tagline är
  HTML-text i `font-heading` med `aria-hidden="true"`, så att skärmläsare läser
  "Grannbo" en gång. SVG:n får inga hex-färger; färgerna sätts med klasserna
  `fill-primary-900`, `fill-accent-500` och `fill-neutral-300` (`onDark`: rutor och
  ringar `fill-white` i stället för `fill-primary-900`).
- `web/public/favicon.svg`: bara märket, med hex-värden direkt i filen (filen
  kan inte läsa CSS-variabler) och `<title>Grannbo</title>`.
- Tester:
  - `web/tests/logo-colors.test.ts` (`// @vitest-environment node`, läser bara
    filer): varje hex-värde i `public/favicon.svg` finns bland färgtokens i
    `tokens.css`; `src/components/brand/Logo.tsx` innehåller ingen hex-färg.
  - `web/src/components/brand/Logo.test.tsx` (jsdom). Testet läser
    `favicon.svg` med Vites `?raw`-import
    (`import faviconSvg from '../../../public/favicon.svg?raw'`), inte med
    `node:fs`, och kan därför ligga intill komponenten i jsdom-miljön. Logo i varje kombination
    av `variant` och `tone` har tillgängligt namn "Grannbo"
    (`getByRole('img', { name: 'Grannbo' })`); ordmärke och tagline har
    `aria-hidden="true"`; `withTagline` visar taglinen ordagrant.
- `index.html` får favicon-raden i 7.10. `Logo` används första gången av
  `SiteHeader` i 1.5b.
- Märkets geometri finns både i `Logo.tsx` och i `favicon.svg`.
  `Logo.test.tsx` kräver att de stämmer: samma `viewBox` och, element för
  element i samma ordning, samma elementtyp och samma geometriattribut (`x`,
  `y`, `width`, `height`, `rx`, `cx`, `cy`, `r`, `d`, `points`); bara färgen
  får skilja (klass i `Logo.tsx`, hex i `favicon.svg`).
- Visuell jämförelse (sidorna finns inte än i 1.8, därför mot favicon-filen):
  byggaren öppnar `public/favicon.svg` med Playwright i 512×512 px, sparar en
  skärmbild i `.scratch/logo/`, läser den bredvid den extraherade JPEG:en och
  redovisar skillnaderna i form i text. Ordmärket och taglinen är HTML-text i
  `font-heading` (F5) och jämförs inte geometriskt med källbilden; deras texter
  kontrolleras i `Logo.test.tsx`. Färgkontroll:
  hex-värdet för varje färgyta i PNG:n (rutor, hus, ljus ruta, ringar,
  ordmärke) jämförs med token-värdet, och avvikelserna redovisas.

## 5. Gränssnitt

### 5.1 Kommandon (byggarens och CI:s kontrakt)

Alla körs med yttre tidsgräns i Git Bash. Status per kommando: avsnitt 12.

**api** (arbetskatalog `api/`):

| Id | Kommando | Syfte |
|----|----------|-------|
| K3 | `timeout 600 dotnet restore Grannbo.slnx --locked-mode` | Återställ mot låsfilerna (första gången utan `--locked-mode`, för att skapa dem) |
| K4 | `timeout 600 dotnet build Grannbo.slnx -c Release --no-restore` | Bygge, varningar är fel |
| K5 | `timeout 600 dotnet format Grannbo.slnx --verify-no-changes --no-restore` | Lint |
| K6 | `timeout 900 dotnet test Grannbo.slnx -c Release --no-build` | Test |

**web** (arbetskatalog `web/`), `package.json`-skript:

| Id | Kommando | Skriptets innehåll |
|----|----------|--------------------|
| K7 | `timeout 900 npm ci` | - |
| K8 | `timeout 300 npm run lint` | `eslint . --max-warnings 0` |
| K9 | `timeout 300 npm run format:check` | `prettier --check .` |
| K10 | `timeout 600 npm run build` | `tsc -b && vite build` |
| K11 | `timeout 900 npm test` | `vitest run` |
| K12 | `timeout 900 npm run test:e2e` | `playwright test` (kräver K10 först) |
| K13 | `timeout 900 npm run lighthouse` | `node scripts/lighthouse.mjs` (kräver K10 först) |
| K24 | `npm run dev -- --port <ledig port> --strictPort` | `vite` (1.5) |
| K25 | `npm run preview` | `vite preview --port 4173 --strictPort` (1.5) |
| K26 | `timeout 300 npm run format` | `prettier --write .` (1.5) |
| K22 | `timeout 900 npm run media:placeholders` | `node scripts/media/make-placeholders.mjs` (avsnitt 8; körs inte i CI) |

`vite.config.ts` har ett `test`-block med `environment: 'jsdom'`,
`setupFiles: ['./src/test/setup.ts']` och
`include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts']`. `e2e/` ingår inte.

**Genererade och ignorerade kataloger under `web/`.** Samma lista står på
följande ställen och ska hållas lika: rotens `.gitignore` (avsnitt 10, med prefixet
`web/`), `web/.prettierignore` och ESLints `globalIgnores`.

`web/.prettierignore`, hela innehållet:

```
dist/
.lighthouse/
.e2e-output/
playwright-report/
test-results/
coverage/
public/media/
package-lock.json
```

`web/eslint.config.js` börjar med
`globalIgnores(['dist', '.lighthouse', '.e2e-output', 'playwright-report', 'test-results', 'coverage', 'public/media'])`
(från `eslint/config`). Prettier läser inte rotens `.gitignore` när
arbetskatalogen är `web/`, därför behövs listan i `.prettierignore`.
`package-lock.json` står bara i `.prettierignore` (den genereras av npm och ska
checkas in). Raden står kvar som skydd även om Prettier skulle hoppa över
filen ändå. Lokalt körs K8 och K9 en gång till efter K10-K13, så att genererade
kataloger syns om de inte är ignorerade.

**Skripten per uppgift.** `package.json` får i 1.5 skripten `dev`, `build`,
`preview`, `lint`, `format`, `format:check` och `test`. `media:placeholders`
läggs till i 1.12, `test:e2e` i 1.22 och `lighthouse` i 1.23; inget av dem
finns i 1.5.

**Kontrollen av skripten i 1.5** (arbetskatalog `web/`, Git Bash):
- K26 `format` körs, och därefter ger K9 `format:check` EXIT=0.
- K25 `preview`: efter K10 startas
  `timeout 60 npm run preview > ../.scratch/preview.log 2>&1 &`, och efter att
  servern svarat ger
  `curl.exe -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:4173/`
  utdata `200`.
- K24 `dev`: på samma sätt med
  `timeout 60 npm run dev -- --port <ledig port> --strictPort > ../.scratch/dev.log 2>&1 &`
  och `curl.exe … http://localhost:<samma port>/` med utdata `200`. Porten
  väljs bland lediga portar; `--strictPort` gör att Vite avbryter i stället för
  att byta port, så att ett 200 från en annan server på porten inte kan räknas
  som godkänt.

**Innehåll som 1.5 skapar** (ordagrant där innehåll anges):

- `web/.prettierrc.json`: `{ "singleQuote": true }`. Inställningen gäller även
  CSS, så CSS-importer skrivs med enkla citattecken.
- `web/src/styles/index.css`: `@import 'tailwindcss';` (tokens och typsnitt
  läggs till i 1.7).
- `web/src/test/setup.ts`: bara raden `import '@testing-library/jest-dom/vitest';`.
  Stubbar för `matchMedia` och `IntersectionObserver` läggs inte här, utan i
  varje testfil som behöver dem, med start i den uppgift som först behöver dem
  (1.12 respektive 1.13). Skäl i D42.
- `web/src/App.tsx`: namngiven export `App` som renderar `<h1>Grannbo</h1>`.
  `App.test.tsx` kontrollerar `getByRole('heading', { level: 1, name: 'Grannbo' })`.
  1.5b ersätter innehållet med routern.
- `web/index.html`: `<html lang="sv">`, `<meta charset="utf-8">`,
  `<meta name="viewport" content="width=device-width, initial-scale=1">` och
  `<title>` enligt 7.10. Övriga rader i 7.10 läggs till i 1.8 (favicon), 1.12
  (preload) och 1.21 (resten).
- `web/src/main.tsx`: renderar `<App />` inom `StrictMode` med `createRoot`,
  importerar `./styles/index.css` och `{ App }` från `./App` utan filändelse.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: de tre filerna
  från create-vite 9.3.4 (mallen `react-ts`). Oxlint och `.oxlintrc.json` från
  mallen tas bort och ersätts av ESLint. Alternativ som TypeScript 6.0.3 inte
  stöder justeras, och byggaren redovisar varje avvikelse från mallen.
  `"strict": true` ska finnas. Det är standard i TypeScript 6.0.3 men skrivs
  ut uttryckligen, så att det inte beror på kompilatorns standardvärde.
  1.7 ändrar `tsconfig.json` och `tsconfig.node.json` och skapar
  `tsconfig.test.json`; det slutliga innehållet i varje tsconfig-fil står under
  "Typkontroll och lint av alla kataloger (1.7)" nedan.
- `web/eslint.config.js`, i den här ordningen: `globalIgnores([...])` enligt
  listan ovan; `js.configs.recommended`; `tseslint.configs.recommended` (inte
  type-checked); `jsxA11y.flatConfigs.strict`;
  `reactHooks.configs.flat.recommended`; `reactRefresh.configs.vite`;
  `languageOptions.globals` = `globals.browser`; `eslint-config-prettier` sist.
  Konfigurationsobjektet med TS/React-reglerna har `files: ['**/*.{ts,tsx}']`.
  1.7 lägger till ett objekt för `.js`/`.mjs`; det slutliga innehållet står
  under "Typkontroll och lint av alla kataloger (1.7)" nedan.

**Typkontroll och lint av alla kataloger (1.7).** Varje katalog och fil under
`web/` som innehåller `.ts`/`.tsx` ingår i `include` i exakt en tsconfig som
`tsc -b` (K10) bygger:

| Katalog/fil | tsconfig | Varför just den |
|-------------|----------|-----------------|
| `src/` | `tsconfig.app.json` | Webbläsarkod och komponenttester (jsdom) |
| `vite.config.ts`, `playwright.config.ts` | `tsconfig.node.json` | Konfigurationsfiler som körs av Node |
| `tests/`, `e2e/` | `tsconfig.test.json` | Testkod som körs av Vitest i Node respektive Playwright: behöver Node-typer (`node:fs`, `process`) och DOM-typer (`DOMParser` i `seo-meta.test.ts`, `document` i `page.evaluate` i `e2e/`) |

Inget eget typkontrollskript och inget eget CI-steg: `npm run build` (K10,
`tsc -b && vite build`) bygger alla projekt i `references` och körs redan i
CI-jobbet `web` (5.4). Filer i `tests/` och `e2e/` använder inga
jest-dom-matchare (de renderar inga komponenter, avsnitt 1); behövs det
lämnas det tillbaka till arkitekten.

`web/tsconfig.json`, hela innehållet ordagrant:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.test.json" }
  ]
}
```

`web/tsconfig.app.json`, hela innehållet ordagrant (oförändrat från 1.5):

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

`web/tsconfig.node.json`, hela innehållet ordagrant (ändringen mot 1.5 är
bara `include`):

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

`web/tsconfig.test.json` (ny i 1.7), hela innehållet ordagrant:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.test.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["node", "vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["tests", "e2e"]
}
```

`"jsx": "react-jsx"` och `vite/client` finns med för att en fil i `tests/` som
importerar en modul i `src/` drar in den modulens importer (`.tsx`, `?raw`).
`playwright.config.ts` och `e2e/` skapas i 1.22; `include` är ett
mönster, och en post som inte matchar något är inget fel så länge projektet har
minst en annan indatafil (ej körd: prövas av K10 och K27 i 1.7).
`tsconfig.test.json` checkas in i samma commit som den första filen i
`tests/`, eftersom ett projekt helt utan indatafiler kan ge TS18003 ("No inputs
were found") i `tsc -b` (ej körd).

`web/eslint.config.js`, hela innehållet ordagrant (ändringen mot 1.5 är det
andra konfigurationsobjektet med `files: ['**/*.{js,mjs}']`):

```js
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist',
    '.lighthouse',
    '.e2e-output',
    'playwright-report',
    'test-results',
    'coverage',
    'public/media',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      jsxA11y.flatConfigs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
]);
```

Objektet för `.js`/`.mjs` gäller `eslint.config.js` (från 1.7) och
`scripts/**/*.mjs` (från 1.12 och 1.23). Alla `.js`/`.mjs` under `web/` som inte är ignorerade
körs i Node, därför `globals.node` och inte `globals.browser`.

**Beviset i 1.7** (arbetskatalog repo-roten, Git Bash, i en kopia under
`.scratch/`, aldrig i `web/`):

- K27, typkontrollens täckning. Kopiera med `rm -rf .scratch/tc && cp -r web .scratch/tc`.
  Lägg för varje rad nedan till sonden, kör `(cd .scratch/tc && timeout 600 npm run build)`,
  kräv EXIT≠0 och att utdatan innehåller `TS2322` och filens sökväg, och ta
  sedan bort sonden innan nästa rad. Sonden är raden
  `export const typeErrProbe: number = 'text';`.

  | Fall | Var sonden läggs |
  |------|------------------|
  | `src/` | ny fil `src/typeerr.ts` |
  | `tests/` | ny fil `tests/typeerr.test.ts` |
  | `e2e/` | ny fil `e2e/typeerr.spec.ts` |
  | `vite.config.ts` | sist i `vite.config.ts` |
  | `playwright.config.ts` | ny fil `playwright.config.ts` med sonden och `export default {};` |

  Redovisa per fall sista raderna och `EXIT=<kod>` ordagrant. Därefter körs
  K8–K11 i det riktiga `web/` med EXIT=0.
- K28, lint av `.js`/`.mjs`. I samma kopia: skapa
  `scripts/probe.mjs` med de två raderna `const unusedProbe = 1;` och
  `console.log(process.argv.length);`, kör `(cd .scratch/tc && timeout 300 npm run lint)`,
  och kräv EXIT≠0, att utdatan innehåller `no-unused-vars` för `unusedProbe`
  och att den **inte** innehåller `no-undef` (Node-globalen `process` är känd).
  Redovisa utdatan och `EXIT=<kod>` ordagrant.
- Kopian `.scratch/tc` tas bort efteråt (`rm -rf .scratch/tc`).

**Compose** (arbetskatalog roten, `.env` kopierad från `.env.example`):

| Id | Kommando | Förväntat |
|----|----------|-----------|
| K14 | `timeout 120 docker compose config --quiet` | exit 0 |
| K15 | `timeout 900 docker compose up -d --build` | exit 0, båda tjänsterna startade |
| K16 | `timeout 60 bash -c 'set -a; . ./.env; set +a; curl.exe -fsS "http://localhost:${API_PORT:-8080}/health"'` | utdata `Healthy`, exit 0. Porten läses ur `.env` (samma värde som Compose använder i `ports`); `docker compose port` valdes bort, eftersom den svarar `0.0.0.0:<port>`, som inte går att ansluta till på Windows. |
| K17 | `timeout 120 docker compose down` | exit 0 |

### 5.2 API (Fas 1)

`Program.cs` registrerar, i den här ordningen:

1. `builder.Services.AddSerilog((services, lc) => lc.ReadFrom.Configuration(builder.Configuration).ReadFrom.Services(services).Enrich.FromLogContext())`
2. `builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context => { … })`,
   där lambdan sätter `context.ProblemDetails.Title` till
   `ProblemTexts.NotFoundTitle` när `context.ProblemDetails.Status` är 404 och
   till `ProblemTexts.InternalServerErrorTitle` när den är 500, och inte rör
   andra statuskoder. Det är det enda anropet till `AddProblemDetails`.
3. `builder.Services.AddHealthChecks()`

och pipelinen, i den här ordningen:

1. `app.UseExceptionHandler()`
2. `app.UseStatusCodePages()`
3. `app.UseSerilogRequestLogging()`
4. `app.MapHealthChecks("/health")`

Ingen HTTPS-omdirigering, ingen OpenAPI, ingen autentisering i Fas 1.
`Program` måste vara åtkomlig för `WebApplicationFactory<Program>`. .NET 10
genererar `public partial class Program`; ger bygget ändå fel läggs raden
`public partial class Program;` sist i `Program.cs` och det noteras i
redovisningen.

| Endpoint | Svar |
|----------|------|
| `GET /health` | `200`, `Content-Type: text/plain`, kropp exakt `Healthy` |
| okänd sökväg | `404`, `Content-Type: application/problem+json`, kroppen har `"status": 404` och `"title": "Det du sökte finns inte."` |
| ohanterat undantag | `500`, `Content-Type: application/problem+json`, kroppen har `"status": 500` och `"title": "Ett oväntat fel inträffade. Försök igen senare."`, och innehåller **inte** undantagets meddelande |

De svenska titlarna är konstanter i `api/src/Grannbo.Api/ProblemTexts.cs`:

```csharp
public static class ProblemTexts
{
    public const string NotFoundTitle = "Det du sökte finns inte.";
    public const string InternalServerErrorTitle = "Ett oväntat fel inträffade. Försök igen senare.";
}
```

De sätts i registreringen ovan (punkt 2). Testerna jämför titlarna med
litteraler i testfilen, inte med konstanterna (D30).

Serilog i `appsettings.json`: `MinimumLevel.Default` = `Information`,
`Override` `Microsoft.AspNetCore` = `Warning`, `WriteTo` = `Console` med
`formatter` = `Serilog.Formatting.Compact.RenderedCompactJsonFormatter, Serilog.Formatting.Compact`.
`appsettings.Development.json` ersätter formattern med textmallen
`[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}`.

`launchSettings.json`: en profil `http`, `applicationUrl` `http://localhost:5080`,
`ASPNETCORE_ENVIRONMENT=Development`.

`Directory.Build.props`: `TargetFramework=net10.0`, `Nullable=enable`,
`ImplicitUsings=enable`, `TreatWarningsAsErrors=true`,
`RestorePackagesWithLockFile=true`, `ManagePackageVersionsCentrally` står i
`Directory.Packages.props`.

**Testpaket.** `Grannbo.Api.Tests` refererar `xunit.v3.mtp-off`, **inte**
`xunit.v3`, plus `xunit.runner.visualstudio`, `Microsoft.NET.Test.Sdk` och
`Microsoft.AspNetCore.Mvc.Testing`. `global.json` får ingen `test`-sektion, och
K6 är oförändrat. Skäl i D37.

**`api/.editorconfig`**, hela innehållet ordagrant:

```
root = true

[*]
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space

[*.cs]
indent_size = 4
csharp_style_namespace_declarations = file_scoped:warning
csharp_using_directive_placement = outside_namespace:warning
csharp_style_var_when_type_is_apparent = true:suggestion
dotnet_sort_system_directives_first = true

[*.{json,csproj,props,slnx,xml}]
indent_size = 2
```

Reglerna med `:warning` kontrolleras av `dotnet format` (K5), inte av bygget
(`EnforceCodeStyleInBuild` sätts inte). Ger K5 fel på befintlig kod efter att
filen lagts till körs `dotnet format Grannbo.slnx` en gång, och K5 körs om.

**Projektreferenser (de enda tillåtna):**

| Projekt | Får referera |
|---------|--------------|
| Grannbo.Domain | inget projekt, inga PackageReference, ingen FrameworkReference |
| Grannbo.Application | Grannbo.Domain |
| Grannbo.Infrastructure | Grannbo.Application, Grannbo.Domain |
| Grannbo.Api | Grannbo.Application, Grannbo.Infrastructure |
| Grannbo.Api.Tests | Grannbo.Api |

**Tester (`api/tests/Grannbo.Api.Tests`):**

- `GrannboApiFactory : WebApplicationFactory<Program>` sätter
  `builder.UseEnvironment("Testing")` (annars lägger WebApplication till
  utvecklarsidan för undantag i Development) och registrerar en
  `IStartupFilter`, `ThrowingEndpointStartupFilter`, som efter `next(app)`
  lägger till `app.Map("/__test/throw", b => b.Run(_ => throw new InvalidOperationException("testundantag-hemligt")))`.
  Endpointen finns bara i testfabriken, aldrig i `Program.cs`. Fångar
  undantagshanteraren inte den vägen lämnas det tillbaka till arkitekten.
- `HealthEndpointTests`: `GET /health` ger 200, `text/plain` och `Healthy`.
- `ProblemDetailsTests`: `GET /finns-inte` ger 404 enligt tabellen, med hela
  titeln; `GET /__test/throw` ger 500 enligt tabellen, med hela titeln, och
  kroppen innehåller inte `testundantag-hemligt`.
- `ProjectReferenceTests`: läser varje `.csproj` under `api/src` (sökväg hittas
  genom att gå uppåt från `AppContext.BaseDirectory` till katalogen med
  `Grannbo.slnx`) och jämför `ProjectReference` mot tabellen ovan, exakt
  (varken fler eller färre). Kontrollerar också att Domain saknar
  `PackageReference` och `FrameworkReference`.
- Inga tester läser `.env`, user-secrets eller en databas.

### 5.3 Docker

`api/Dockerfile` (kontext `api/`), stegen:

1. `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build`: kopiera `global.json`,
   `Directory.Build.props`, `Directory.Packages.props`, alla
   `src/*/*.csproj` och deras `packages.lock.json`; `dotnet restore
   src/Grannbo.Api/Grannbo.Api.csproj --locked-mode`; kopiera `src/`;
   `dotnet publish src/Grannbo.Api/Grannbo.Api.csproj -c Release -o /app/publish --no-restore`.
2. `FROM mcr.microsoft.com/dotnet/aspnet:10.0`: kopiera `/app/publish`,
   `USER $APP_UID`, `EXPOSE 8080`, `ENTRYPOINT ["dotnet", "Grannbo.Api.dll"]`.

`api/.dockerignore`: `**/bin/`, `**/obj/`, `tests/`, `.vs/`.

`docker-compose.yml` (roten):

- `db`: `image: postgres:17-alpine`; `environment` med
  `POSTGRES_USER: ${POSTGRES_USER:?Sätt POSTGRES_USER i .env}`, samma form för
  `POSTGRES_PASSWORD` och `POSTGRES_DB`; `ports: "${POSTGRES_PORT:-5432}:5432"`;
  volym `pgdata:/var/lib/postgresql/data`; `healthcheck` med
  `pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}`, intervall 5 s, 10 försök.
- `api`: `build: { context: ./api, dockerfile: Dockerfile }`;
  `environment: ASPNETCORE_ENVIRONMENT: ${ASPNETCORE_ENVIRONMENT:-Development}`;
  `ports: "${API_PORT:-8080}:8080"`; `depends_on: db: condition: service_healthy`.
- `volumes: pgdata:`.
- Inga lösenord eller andra hemligheter som värden i filen. API:t får ingen
  anslutningssträng i Fas 1.

### 5.4 CI (`.github/workflows/ci.yml`)

- `name: CI`; `on: pull_request` (alla grenar) och `push` till `main`.
- `permissions: contents: read`; `concurrency` per gren med
  `cancel-in-progress: true`.
- Actions används med major-tagg (`actions/checkout`, `actions/setup-dotnet`,
  `actions/setup-node`); byggaren väljer senaste major enligt respektive
  repos README vid byggtillfället och redovisar den.

Jobb `api` (`runs-on: ubuntu-latest`, `timeout-minutes: 15`,
`defaults.run.working-directory: api`):
checkout → setup-dotnet med `dotnet-version: '10.0.x'` → K3 → K4 → K5 → K6
(utan `timeout`-prefix; jobbets `timeout-minutes` är tidsgränsen).

Jobb `web` (`runs-on: ubuntu-latest`, `timeout-minutes: 15`,
`defaults.run.working-directory: web`):
checkout → setup-node med `node-version-file: web/.nvmrc`, `cache: npm`,
`cache-dependency-path: web/package-lock.json` → `npm ci` → `npm run lint` →
`npm run format:check` → `npm run build` → `npm test`.

Typkontrollen av `src/`, `tests/`, `e2e/`, `vite.config.ts` och
`playwright.config.ts` körs i CI av steget `npm run build` (K10, `tsc -b`),
enligt tabellen "Typkontroll och lint av alla kataloger (1.7)" i 5.1. `ci.yml`
ändras inte för det.

SDK-versionen i jobbet `api` låses inte (`dotnet-version: '10.0.x'` står kvar,
D45). Blir K3 eller K4 röd i CI utan att koden ändrats: läs SDK-versionen i
loggen från `setup-dotnet` och felkoden. NU1901–NU1904 (NuGetAudit) åtgärdas
genom att det sårbara paketet uppdateras i en egen commit; varningar från en
ny SDK lämnas tillbaka till arkitekten.

K12 och K13 körs inte i CI i Fas 1.

### 5.5 Komponentbiblioteket: se avsnitt 6. Landningssidan: se avsnitt 7.

### 5.6 Router (`web/src/App.tsx`)

| Sökväg | Komponent | Laddning | `<title>` | Uppgift |
|--------|-----------|----------|-----------|---------|
| `/` | `LandingPage` | direkt | `Grannbo: boka tvättstuga, bastu och festlokal` | 1.5b |
| `/integritet` | `PrivacyPage` | `lazy` | `Integritetspolicy \| Grannbo` | 1.19 |
| `/demo` | `DemoPlaceholderPage` | `lazy` | `Demo \| Grannbo` | 1.5b |
| `*` | `NotFoundPage` | `lazy` | `Sidan finns inte \| Grannbo` | 1.5b |

Kolumnen "Uppgift" anger var routen läggs till. `/integritet` läggs till i 1.19,
när sidan skapas; före dess ger sökvägen `NotFoundPage`.

(`\|` ovan är tabellescape; titeln innehåller ett vanligt `|`.)

Varje sida: `SiteHeader`, `<main id="innehall">`, `SiteFooter` (`SiteFooter`
från 1.19). `SiteHeader` börjar med länken `Hoppa till innehållet` till
`#innehall`, synlig bara vid fokus, följd av `Logo` som länk till `/` med
`aria-label="Grannbo, till startsidan"`.

```ts
// web/src/components/layout/SiteHeader.tsx
export interface SiteHeaderProps {
  tone: 'onLight' | 'onDark';    // obligatorisk; '/' använder 'onDark', övriga sidor 'onLight'
}
export function SiteHeader(props: SiteHeaderProps): JSX.Element;
```

På `/` ligger headern ovanpå heron (`tone="onDark"`); på övriga sidor på
`neutral-50` (`tone="onLight"`).

## 6. Komponentbiblioteket (`web/src/components/ui`)

Gemensamt: alla komponenter är funktionskomponenter med `forwardRef` där ett
DOM-element exponeras (React 19: `ref` som vanlig prop), exporteras namngivet
och samlas i `web/src/components/ui/index.ts`. Klassnamn slås ihop med `cn()`
och en inkommande `className` läggs sist.

```ts
// web/src/lib/cn.ts
export function cn(...parts: Array<string | false | null | undefined>): string;
```

### 6.1 Button (`Button.tsx`) - 1.9

```ts
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function buttonClassName(opts: { variant?: ButtonVariant; size?: ButtonSize }): string;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;   // standard 'primary'
  size?: ButtonSize;         // standard 'md'
  icon?: React.ReactNode;    // dekorativ, renderas med aria-hidden="true" före texten
}
export function Button(props: ButtonProps): JSX.Element;   // type standard 'button'

type ButtonLinkBase = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};
export type ButtonLinkProps =
  | (ButtonLinkBase & { to: string; href?: never })    // intern route -> React Router <Link>
  | (ButtonLinkBase & { href: string; to?: never });   // '#ankare', '/#ankare', 'mailto:' -> <a>
export function ButtonLink(props: ButtonLinkProps): JSX.Element;
```

| Variant | Yta | Text | Kant | Kontrastpar |
|---------|-----|------|------|-------------|
| primary | primary-900, hover primary-800 | white | - | T5, T6 |
| accent | accent-500 | primary-900 | - | T7 |
| secondary | transparent | primary-900 | primary-900 | T1, N3 |
| inverse | transparent | white | white | T18, N5 (bara på mörk botten) |

Storlekar: `sm` `h-9 px-3 text-sm`, `md` `h-11 px-5 text-base`, `lg` `h-12 px-6 text-lg`.
`disabled` ger `opacity-60 cursor-not-allowed` och inget hover-byte.
Tester: varje variant och storlek, `disabled` går inte att klicka, Enter och
mellanslag aktiverar, fokus når knappen med Tab och har fokusklasserna,
`ButtonLink` med `to` blir en länk till rätt sökväg, med `href` en `<a>` med
exakt det `href`.

### 6.2 Input (`Input.tsx`) - 1.9

```ts
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;             // obligatorisk, alltid kopplad med <label htmlFor>
  hideLabel?: boolean;       // etiketten blir visuellt dold (sr-only), inte borttagen
  hint?: string;             // hjälptext under fältet
  error?: string;            // felmeddelande; sätter aria-invalid="true"
}
export function Input(props: InputProps): JSX.Element;
```

- `id` från props, annars `useId()`. `aria-describedby` = hint-id och/eller
  error-id i den ordningen, utelämnas om ingen finns.
- `required` ger etikettens text följd av ` (obligatoriskt)`.
- Felet visas under fältet i `danger-700` (T13, T14) med id `<id>-error`;
  hjälptexten i `neutral-600` med id `<id>-hint`. Kant `neutral-500` (N1, N2),
  vid fel `danger-700`.
- **Ingen anropare i `src/` sedan P5 - behålls därför att specen (avsnitt 6)
  kräver formulärkomponenter i komponentbiblioteket; första anropare blir
  inloggningen i Fas 3.**
- Tester: etiketten hittas med `getByLabelText`, `hideLabel` behåller det
  tillgängliga namnet, `aria-describedby` och `aria-invalid` i alla
  kombinationer av hint/error, Tab-fokus och fokusklasser, `required`-texten.

### 6.3 Card (`Card.tsx`) - 1.10

```ts
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'li';      // standard 'div'
  variant?: 'default' | 'elevated';   // standard 'default'
  padding?: 'none' | 'md' | 'lg';     // standard 'md'; 'none' för kort med bild i kanten
}
export function Card(props: CardProps): JSX.Element;
```

`default`: `bg-white border border-neutral-300 rounded-lg`. `elevated`:
`bg-white rounded-lg shadow-md`. Padding: `md` `p-5`, `lg` `p-8`.
Tester: rätt element för varje `as`, varje variant och padding ger sina klasser.

### 6.4 Badge (`Badge.tsx`) - 1.10

```ts
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent';     // standard 'neutral'
}
export function Badge(props: BadgeProps): JSX.Element;
```

`neutral`: `bg-primary-100 text-primary-900` (T11). `accent`:
`bg-accent-100 text-accent-700` (T10). Båda `rounded-sm px-2 py-0.5 text-sm font-medium`.
Används för "Exempel" (prisplan) och "Illustration" (för styrelsen, mobilappen).

### 6.5 Skeleton (`Skeleton.tsx`) - 1.10

```ts
export interface SkeletonProps {
  shape?: 'rect' | 'text' | 'circle';  // standard 'rect'
  lines?: number;                       // bara 'text', standard 1, heltal ≥ 1
  className?: string;                   // storlek sätts av anroparen
}
export function Skeleton(props: SkeletonProps): JSX.Element;
```

- Alltid `aria-hidden="true"`; tillståndet "laddar" annonseras av behållaren
  (`LazySection` sätter `aria-busy="true"`).
- Animation bara med `motion-safe:animate-pulse`; klassen `animate-pulse` får
  inte förekomma utan prefixet. Yta `bg-primary-100`.
- Tester: varje form, `lines` ger så många rader, `aria-hidden`, och att
  klasslistan innehåller `motion-safe:animate-pulse` men inte ett fristående
  `animate-pulse`.

### 6.6 EmptyState (`EmptyState.tsx`) - 1.10

```ts
export interface EmptyStateProps {
  title: string;                 // obligatorisk
  description?: string;
  icon?: React.ReactNode;        // dekorativ, aria-hidden
  action?: React.ReactNode;      // t.ex. <ButtonLink to="/">
  headingLevel?: 1 | 2 | 3;      // standard 2
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
```

Används av `DemoPlaceholderPage` och `NotFoundPage` med `headingLevel={1}`.
Tester: rubriknivån, att valfria delar inte renderas när de saknas.

### 6.7 Toast (`Toast.tsx`) - 1.11

```ts
export type ToastVariant = 'info' | 'success' | 'error';
export interface ToastOptions {
  title: string;                 // obligatorisk
  description?: string;
  variant?: ToastVariant;        // standard 'info'
  durationMs?: number;           // standard 5000; 0 = stängs bara manuellt
}
export function ToastProvider(props: { children: React.ReactNode }): JSX.Element;
export function useToast(): {
  show(options: ToastOptions): string;   // returnerar toastens id
  dismiss(id: string): void;
};
```

- `useToast` utanför `ToastProvider` kastar `Error('useToast måste användas inom ToastProvider')`.
- Providern renderar alltid (även tom) en `<section aria-label="Notiser">` med dessa
  levande behållare: `role="status"` (`aria-live="polite"`) för `info` och
  `success`, `role="alert"` för `error`. Behållarna finns i DOM innan första
  toasten, annars annonseras den inte.
- Varje toast har en stängknapp `<button aria-label="Stäng notis">`. Fokus flyttas
  aldrig till en toast. `Escape` när fokus är inne i en toast stänger den.
  Tidtagningen pausas när pekaren är över toasten eller fokus är i den.
- In/ut-animation bara med `motion-safe:`.
- Färger: info T17, success T16, error T15. `rounded-lg shadow-lg`.
- **Ingen anropare i `src/` sedan P5 - behålls därför att specen (avsnitt 6)
  kräver toasts i komponentbiblioteket; första anropare blir inloggningen i
  Fas 3.** `ToastProvider` monteras inte i `App.tsx` i Fas 1.
- Tester (med falska timers): rätt behållare per variant, att texten hamnar i
  behållaren, stängning med knapp, Tab och Enter, och Escape, automatisk
  stängning efter `durationMs`, `0` stänger aldrig, paus vid fokus, felet utanför
  provider.

### 6.8 Accordion (`Accordion.tsx`) - 1.11

```ts
export interface AccordionItem {
  id: string;                    // ASCII, unikt inom listan
  title: string;
  content: React.ReactNode;
}
export interface AccordionProps {
  items: readonly AccordionItem[];
  headingLevel: 2 | 3 | 4;       // obligatorisk
  allowMultiple?: boolean;       // standard true
  defaultOpenIds?: readonly string[];  // standard []
}
export function Accordion(props: AccordionProps): JSX.Element;
```

WAI-ARIA-mönstret Accordion: varje rubrik `<hN>` innehåller en `<button>` med
`aria-expanded` och `aria-controls`; panelen har `role="region"`,
`aria-labelledby` = knappens id och attributet `hidden` när den är stängd.
Tangentbord: Enter och mellanslag växlar; Pil ned/upp flyttar fokus till
nästa/föregående rubrikknapp (med varv runt); Home/End till första/sista.
Chevron-ikonen roterar med `motion-safe:transition-transform`.
Tester: alla tangenter ovan, ARIA-attributen i öppet och stängt läge,
`allowMultiple={false}` stänger den tidigare öppna, `defaultOpenIds`.

### 6.9 Övriga delade komponenter

```ts
// web/src/components/media/ResponsiveImage.tsx
export interface ResponsiveImageProps {
  basePath: string;              // '/media/premises/laundry' -> laundry-480.avif osv.
  widths: readonly number[];     // [480, 800, 1200]
  alt: string;                   // obligatorisk; '' bara för rent dekorativa bilder
  sizes: string;
  width: number;                 // inneboende mått, mot CLS
  height: number;
  className?: string;
}
```

Renderar `<picture>` med `<source type="image/avif" srcSet=…>`,
`<source type="image/webp" srcSet=…>` och `<img src="<basePath>-800.jpg" srcSet=… sizes width height alt loading="lazy" decoding="async">`.
Används bara nedanför heron.

```ts
// web/src/features/landing/LazySection.tsx
export type LazyRegionId = SectionId | 'sidfot';
export interface LazySectionProps {
  id: LazyRegionId;              // 'sidfot' bara för footern på landningssidan
  component: React.LazyExoticComponent<React.ComponentType>;  // skapad med lazy() på modulnivå
  minHeightClass: string;        // uppskattad höjd, t.ex. 'min-h-[40rem]'; justeras i 1.22
}
export function LazySection(props: LazySectionProps): JSX.Element;
```

Beteende: omslaget `<div id={id} class="scroll-mt-4">` finns alltid. Komponenten
monteras (i `<Suspense>` med `Skeleton` som reserv och `aria-busy="true"` på
omslaget tills den laddat) vid det första av:
(a) `IntersectionObserver` med `rootMargin: '400px 0px'` ser omslaget;
(b) `window`-händelsen `load` har inträffat och därefter `requestIdleCallback`
(reserv `setTimeout(…, 200)` där den saknas) - så att alla sektioner finns för
tangentbord och skärmläsare kort efter laddning;
(c) `location.hash` är satt när sidan öppnas - då monteras alla direkt och sidan
rullar till ankaret när sektionen laddat;
(d) `IntersectionObserver` saknas - då monteras den direkt.
Sektionskomponenterna sätter inte `id` själva; de renderar
`<section aria-labelledby="<id>-rubrik">` med `<h2 id="<id>-rubrik">`.
`SiteFooter` renderar `<footer>` och tar inga props
(`export function SiteFooter(): JSX.Element`); på landningssidan ligger den i
`<LazySection id="sidfot" component={LazySiteFooter} …>`, på övriga sidor
renderas den direkt (D31).

## 7. Landningssidan

Ordning i `LandingPage`: `SiteHeader` (över heron), `<main id="innehall">` med
`Hero` (direktimporterad) och en `LazySection` per `SectionId` i ordningen i
`SectionId`-typen, och efter `</main>` `<LazySection id="sidfot">` med
`SiteFooter` (gränssnittet i 6.9). Exakt en `<h1>` på sidan, i heron.

Alla texter nedan är bindande ordagrant och står i `content.ts`.

### 7.1 Hero (1.12) - ingenting här lazy-loadas

- `<section aria-labelledby="hero-rubrik">`, `min-h-svh`, mediet i bakgrunden
  (`absolute inset-0 object-cover`), gradient från `overlay` (topp) till
  `overlay-strong` (botten) över mediet, text och knappar ovanpå.
- h1: `Boka föreningens lokaler utan krångel`
- Undertext: `Grannbo låter boende i bostadsrättsföreningen boka tvättstuga, bastu och festlokal, med föreningens egna regler inbyggda.`
- Knapp 1: `ButtonLink` `to="/demo"`, variant `accent`, size `lg`, text `Testa demon`.
- Knapp 2: `ButtonLink` `href="#sa-fungerar-det"`, variant `inverse`, size `lg`,
  text `Se hur det fungerar`.
- Media-val:

```ts
// web/src/features/landing/heroMedia.ts
export type HeroMediaMode = 'video' | 'poster';
export interface NetworkInformationLike { saveData?: boolean; effectiveType?: string }
export function isSlowConnection(connection: NetworkInformationLike | undefined): boolean;
//   true  om connection.saveData === true
//         eller connection.effectiveType är 'slow-2g', '2g' eller '3g'
//   false annars, och när connection är undefined (fallback: webbläsare utan
//         navigator.connection, t.ex. Safari och Firefox, får videon; postern
//         visas ändå tills videon kan spelas)
export function getHeroMediaMode(env: { reducedMotion: boolean; connection?: NetworkInformationLike }): HeroMediaMode;
//   'poster' om reducedMotion eller isSlowConnection(connection), annars 'video'
export function useHeroMediaMode(): HeroMediaMode;
//   Läser matchMedia('(prefers-reduced-motion: reduce)') och navigator.connection
//   synkront i initialt state (så att videon aldrig börjar hämtas i onödan),
//   och lyssnar på 'change' för reduced-motion (byter till 'poster' direkt).
```

- Läge `video`:
  `<video autoPlay muted loop playsInline preload="auto" poster="/media/hero-poster.jpg" aria-hidden="true" tabIndex={-1}>`
  med `<source src="/media/hero-drone.webm" type="video/webm">` före
  `<source src="/media/hero-drone.mp4" type="video/mp4">`. Plus en `Button`
  (variant `inverse`, size `sm`, ikon paus/spela) nere till höger med texten
  `Pausa bakgrundsvideon` respektive `Spela upp bakgrundsvideon`
  (WCAG 2.2.2: rörelse som startar automatiskt och varar mer än 5 s ska kunna
  pausas). React sätter `muted` som egenskap; testet kontrollerar
  `video.muted === true`.
- Läge `poster`: `<img src="/media/hero-poster.jpg" alt="" width="1920" height="1080" fetchPriority="high">`
  utan `loading`-attribut. Ingen `<video>` och ingen pausknapp renderas.
- `index.html` har `<link rel="preload" as="image" href="/media/hero-poster.jpg" fetchpriority="high">`.
- Tester: båda knapparnas text och mål; videons attribut och källornas ordning
  och typer; `getHeroMediaMode` för alla kombinationer (reduced motion,
  `saveData`, varje `effectiveType` inklusive `'4g'`, `connection` undefined);
  att läge `poster` inte renderar `<video>`; att inget element i heron har
  `loading="lazy"`; pausknappen pausar och byter text.

### 7.2 Så fungerar det (1.13) - `id="sa-fungerar-det"`

- h2: `Så fungerar det`
- Tre steg i en `<ol>`, h3 + text + egenritad ikon (ingen BankID-logotyp):
  1. `Logga in med BankID` - `Du identifierar dig med BankID och kopplas till din lägenhet.`
  2. `Välj lokal` - `Tvättstuga, bastu eller festlokal. Du ser direkt vilka pass som är lediga.`
  3. `Boka` - `Välj ett pass och bekräfta. Bryter bokningen mot en regel får du veta varför.`
- Tester: rubrik, stegens ordning och texter, att sektionen laddas via `LazySection`.

### 7.3 Lokalerna (1.14) - `id="lokalerna"`

- h2: `Lokalerna`
- Ett `Card as="li" padding="none"` per lokal i tabellen nedan, i en `<ul>`: `ResponsiveImage` överst
  (`widths [480, 800, 1200]`, `width 1200`, `height 800`,
  `sizes "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"`), h3 med
  namnet, och reglerna som `<dl>` (`<dt>` = label, `<dd>` = value).
- Värdena är specens tabell (avsnitt 3) ordagrant. Enda avvikelsen: cellen
  `Veckovis (se nedan)` blir värdet nedan, eftersom "se nedan" inte har något
  "nedan" på kortet. Den nya texten är hämtad ur specens punkt om veckovis
  bokningsfönster (avsnitt 3), och varför avvikelsen finns står i D28.
  Skrivet med escapes som i källan:

| Lokal (`name`) | Pass | Kvot | Bokningsfönster | Avbokning | Special |
|---|---|---|---|---|---|
| `Tvättstuga` | `Fasta: 07\u201310, 10\u201313, 13\u201316, 16\u201319, 19\u201322` | `Max 2 pass/vecka per lägenhet` | `Veckovis. Bokningen för nästa vecka öppnar på söndagen.` | `Senast 1 h innan` | `Bokat pass gäller hela passet, inget släpps automatiskt` |
| `Bastu` | `1 h, 16\u201322` | `Max 1/dag, 3/vecka` | `Veckovis. Bokningen för nästa vecka öppnar på söndagen.` | `Senast 2 h innan` | `Pass märkta Dam / Herr / Gemensamt` |
| `Festlokal` | `Heldag eller kväll (till 01:00)` | `Max 1 per månad` | `Högst 3 mån fram, minst 7 dagar innan` | `Senast 14 dagar innan` | `Kräver godkännande av styrelsen; städkontroll efteråt` |

- `imageAlt` för platshållarna (se avsnitt 8): `Illustration av tvättstugan`,
  `Illustration av bastun`, `Illustration av festlokalen`. Byts när riktiga
  foton finns.
- Tester: varje värde ovan som litteral med escapes; varje `<img>` har icke-tomt
  `alt`, `srcset` och `loading="lazy"`; båda `<source>`-typerna finns.

### 7.4 För styrelsen (1.15) - `id="for-styrelsen"`

- h2: `För styrelsen`
- Ingress: `Styrelsen ställer in reglerna för varje lokal, godkänner bokningar av festlokalen och når alla boende med utskick.`
- Lista: `Regler per lokal: kvoter, bokningsfönster och avbokningstid` /
  `Godkännande av bokningar av festlokalen` / `Bilder per lokal` /
  `Utskick till alla boende`
- Illustrationerna nedan (A5), byggda som komponenter i HTML/CSS (inga rasterbilder),
  var och en i `<figure>` med `role="img"` på illustrationsytan och
  `aria-label`, plus `Badge` `Illustration` och `<figcaption>`:
  - `aria-label="Illustration av adminpanelen: regler för tvättstugan"`; visar
    rubriken `Regler: Tvättstuga` och raderna `Max 2 pass/vecka per lägenhet`
    och `Senast 1 h innan`.
  - `aria-label="Illustration av adminpanelen: bokningar som väntar på godkännande"`;
    visar rubriken `Väntar på godkännande` och raden `Festlokal, Lgh 1104`.
  - Gemensam `<figcaption>`: `Illustration. Bilden visar hur adminpanelen är tänkt att se ut.`
- Tester: texterna, `Badge` och figcaption på båda, att ingen `<img>` finns i sektionen.

### 7.5 Mobilappen (1.16) - `id="mobilappen"`

- h2: `Mobilappen`
- Ingress: `Boka, se dina bokningar och avboka från mobilen. Appen påminner dig innan ditt pass och säger till när ett tvättpass blir ledigt.`
- Telefonmockup i HTML/CSS (`rounded-xl`, ingen tillverkares form eller
  logotyp, ingen appbutik-märkning) i `<figure>` med `role="img"`,
  `aria-label="Illustration av mobilappen med notiser"`, `Badge`
  `Illustration`, `<figcaption>` `Illustration av appen.`
- Notiserna (`title` `Grannbo`), ordagrant från specens avsnitt 5:
  `Ett tvättpass har blivit ledigt i dag` /
  `Nu kan du boka tvättstuga och bastu för nästa vecka` /
  `Din bokning av festlokalen är godkänd`
- Tester: varje notistext ovan som litteral, Badge, figcaption.

### 7.6 Prisplan (1.17) - `id="prisplan"`

- h2: `Prisplan` följd av `Badge variant="accent"` `Exempel`.
- Text: `Exempel på prissättning för en fiktiv produkt. Det går inte att köpa eller betala något.`
- Ett `Card as="li"` per nivå i tabellen nedan, i en `<ul>`, i tabellens ordning. Varje kort: h3 med
  `name`, priset i ett `<p>`, och `features` som `<ul>`. Innehållet är F6,
  ordagrant (mellanslagen är vanliga U+0020):

| `name` (h3) | `price` | `features` |
|-------------|---------|------------|
| `Bas` | `490 kr/mån` | `Upp till 30 lägenheter` / `Alla lokaler` |
| `Förening` | `990 kr/mån` | `Upp till 150 lägenheter` / `BankID` / `Mobilapp med notiser` |
| `Fastighetsägare` | `Pris på förfrågan` | `Flera föreningar` / `Gemensam administration` |

- Ingen `<form>`, ingen `<input>`, inga knappar eller länkar som påstår köp.
  Varje nivå har en `ButtonLink to="/demo"` variant `secondary` med texten `Testa demon`.
- `Pris på förfrågan` är ingen länk och ingen knapp.
- Tester: exempeltexten och Badge; varje namn, pris och punkt i tabellen som
  litteral och i tabellens ordning; frånvaro av `form`/`input`; att varje länk i
  sektionen går till `/demo`.

### 7.7 Vanliga frågor (1.18) - `id="vanliga-fragor"`

- h2: `Vanliga frågor`; `Accordion headingLevel={3}`, alla stängda från början.

| id | Fråga | Svar |
|----|-------|------|
| `vad-ar-grannbo` | `Vad är Grannbo?` | `Grannbo är ett bokningssystem där boende i en bostadsrättsförening bokar gemensamma lokaler: tvättstuga, bastu och festlokal. Det är ett portfolioprojekt, och demoföreningen Brf Solgläntan är fiktiv.` |
| `logga-in` | `Hur loggar jag in?` | `Med BankID. I demon finns också knapparna Logga in som boende och Logga in som styrelse, så att du kan prova utan BankID.` |
| `nasta-vecka` | `När kan jag boka nästa veckas pass i tvättstugan och bastun?` | `Tvättstuga och bastu bokas en vecka i taget, måndag till söndag. Bokningen för nästa vecka öppnar på söndagen innan veckan börjar, i demoföreningen söndag kl. 00:00. Styrelsen kan ändra veckodag och klockslag.` |
| `samma-pass` | `Kan två boende boka samma pass?` | `Nej. Ett pass kan bara bokas en gång. Försöker två boka samma pass samtidigt lyckas bara den ena bokningen.` |
| `per-lagenhet` | `Gäller kvoterna per person?` | `Nej, kvoter och regler gäller per lägenhet. I demoföreningen får varje lägenhet till exempel boka högst 2 tvättpass per vecka.` |
| `festlokalen` | `Hur bokar jag festlokalen?` | `Festlokalen bokas högst 3 månader och minst 7 dagar i förväg, och styrelsen behöver godkänna bokningen. Avbokning går senast 14 dagar innan.` |
| `andra-regler` | `Kan styrelsen ändra reglerna?` | `Ja. Styrelsen ställer in reglerna per lokal i adminpanelen, till exempel kvoter, bokningsfönster och avbokningstid.` |
| `kostnad` | `Kostar det något?` | `Grannbo är ett portfolioprojekt. Prisplanen på sidan är ett exempel för en fiktiv produkt, och det går inte att betala för något.` |
| `appen` | `Finns det en app?` | `Ja, en mobilapp för boende med bokning, avbokning och push-notiser, till exempel en påminnelse 30 min innan passet.` |

Varje svar bygger på specen (avsnitt 2, 3, 4, 5, 6). Tester: varje fråga och
svar som litteral.

### 7.8 Footer (1.19) - `SiteFooter`, `bg-primary-900`

- `Logo tone="onDark" withTagline`.
- Navigering `<nav aria-label="Sidfot">` med länkarna, i den här ordningen:
  `Så fungerar det` → `/#sa-fungerar-det`, `Lokalerna` → `/#lokalerna`,
  `För styrelsen` → `/#for-styrelsen`, `Mobilappen` → `/#mobilappen`,
  `Prisplan` → `/#prisplan`, `Vanliga frågor` → `/#vanliga-fragor`,
  `Integritetspolicy` → `/integritet`.
- Kontakt: `Kontakt: ` följt av länken `hej@grannbo.se` → `mailto:hej@grannbo.se`.
- Raden, ordagrant (F1 besvarad: inget namn i footern):
  `Grannbo är ett portfolioprojekt. Brf Solgläntan är en fiktiv förening.`
  Inget namn, ingen länk till en person och ingen platshållare som
  `[mitt namn]` får finnas i footern. Specens rad med `[mitt namn]` gäller
  alltså inte; användarens besked går före.
- Tester: varje länk och dess `href`; att varje intern länk (`/...`) pekar på en
  route i 5.6 och varje ankare på ett `SectionId`; raden ordagrant som litteral;
  att footerns text inte innehåller `[` eller orden `mitt namn`
  (skiftlägesokänsligt).

### 7.9 Integritetspolicy, demo och 404

`PrivacyPage` (`/integritet`), h1 `Integritetspolicy`, sedan
`Senast uppdaterad: 2026-11-20` (datumet ändras i samma ändring som texten
under det ändras), och styckena:

1. `Grannbo är ett portfolioprojekt. Den här sidan beskriver vad webbplatsen gör med uppgifter om dig.`
2. `Webbplatsen sätter inga kakor och använder ingen statistik- eller annonstjänst. Typsnitt, bilder och film hämtas från webbplatsen själv och inte från någon annan tjänst.`
3. `Skickar du e-post till hej@grannbo.se använder vi din adress bara för att svara dig.`

Texten granskas om i Fas 6 när värd och serverloggar är kända (det är inte en
uppgift i Fas 1).

`DemoPlaceholderPage` (`/demo`): `EmptyState headingLevel={1}`,
title `Demon är inte öppen än`,
description `Här kommer du att kunna logga in som boende eller styrelse i den fiktiva föreningen Brf Solgläntan.`,
action `ButtonLink to="/"` variant `primary` `Till startsidan`.

`NotFoundPage` (`*`): `EmptyState headingLevel={1}`, title `Sidan finns inte`,
description `Adressen kan vara felstavad, eller så har sidan flyttats.`,
action `ButtonLink to="/"` variant `primary` `Till startsidan`.

### 7.10 SEO och meta (1.21)

`index.html`: `<html lang="sv">`, `<meta charset="utf-8">`,
`<meta name="viewport" content="width=device-width, initial-scale=1">`,
`<title>Grannbo: boka tvättstuga, bastu och festlokal</title>`,
`<meta name="description" content="Grannbo är ett bokningssystem där boende i en bostadsrättsförening bokar tvättstuga, bastu och festlokal. Ett portfolioprojekt med en fiktiv demoförening.">`,
`<meta name="theme-color" content="#1B2A41">`,
`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
Open Graph: `og:type` `website`, `og:locale` `sv_SE`, `og:title` = titeln,
`og:description` = description, `og:url` `https://grannbo.se/`,
`og:image` `https://grannbo.se/media/og-image.jpg`, `og:image:width` `1200`,
`og:image:height` `630`, och `twitter:card` `summary_large_image`.
Domänen kommer från specen (Fas 6) och svarar inte förrän då. Ingen
`canonical` i Fas 1.

`web/public/robots.txt`, hela innehållet, en rad var: `User-agent: *` och `Allow: /`.

Test `seo-meta.test.ts` läser `index.html` och kontrollerar varje rad ovan.

### 7.11 Spärren mot påhittade omdömen, riktiga logotyper och riktiga betalningar (1.21)

```ts
// web/tests/support/contentGuard.ts
export interface GuardViolation { file: string; rule: GuardRuleId; match: string }
export type GuardRuleId = 'testimonial' | 'rating' | 'store-badge' | 'payment-brand'
  | 'payment-flow' | 'brand-logo-file' | 'form-on-public-page';
export function normalizeForScan(text: string): string;
export function findForbiddenContent(file: string, text: string): GuardViolation[];
export function scanPaths(rootDir: string): string[];   // filerna i "Omfång" nedan
```

`normalizeForScan` gör, i ordning: avkodar numeriska HTML-teckenreferenser
(`&#66;`, `&#x42;`) och de namngivna `&nbsp; &amp; &lt; &gt; &quot; &apos; &shy; &aring; &auml; &ouml; &Aring; &Auml; &Ouml; &eacute;`;
avkodar JS-escapes `\uXXXX`, `\u{X...}` och `\xXX`; tar bort U+00AD, U+200B,
U+200C, U+200D och U+FEFF; NFKC-normaliserar; byter varje följd av blanktecken
(inklusive U+00A0) mot ett mellanslag; gör om till gemener.

Mönster per roll (körs mot normaliserad text, skiftlägesokänsligt):

| Regel | Mönster |
|-------|---------|
| `testimonial` | `/omd[öo]me\|recension\|kundcitat\|testimonial\|kundr[öo]st\|s[äa]ger om oss\|review/` |
| `rating` | `/stj[äa]rn\|betyg\|[★☆⭐]\|\b\d+([.,]\d+)?\s*(av\|\/\|of)\s*(5\|10)\b\|rating/` |
| `store-badge` | `/app\s*-?\s*store\|google\s*-?\s*play\|play\s*butik/` |
| `payment-brand` | `/\bvisa\s*(kort\|card\|electron)\b\|mastercard\|master\s*card\|amex\|american\s*express\|klarna\|swish\|stripe\|paypal\|apple\s*-?\s*pay\|google\s*-?\s*pay/` |
| `payment-flow` | `/kortnummer\|card\s*number\|cc-(number\|exp\|csc\|name)\|\bcvc\b\|\bcvv\b\|checkout\|kassan\|betala\s*nu\|k[öo]p\s*nu\|l[äa]gg\s*i\s*varukorg/` |
| `brand-logo-file` | filnamn under `web/public` som matchar `/bank\s*-?\s*id\|visa\|mastercard\|klarna\|swish\|stripe\|paypal\|app\s*-?\s*store\|google\s*-?\s*play\|logo/` utom `favicon.svg` |
| `form-on-public-page` | `/<form\b/` i `index.html` och i filer under `src/features/` |

(`\|` i tabellen är tabellescape för `|`.)

Omfång (`scanPaths`): `web/index.html`; alla filer under `web/src` utom
`*.test.ts`, `*.test.tsx` och `web/src/test/`; alla textfiler under
`web/public` (`.svg`, `.txt`, `.html`, `.json`, `.webmanifest`); filnamnen
(inte innehållet) för alla filer under `web/public`. `web/tests/` skannas inte
(spärren och dess testfall innehåller de förbjudna orden).

`content-guard.test.ts` har delarna:
1. Mutationsfall: för varje regel minst tre stavningar som ska ge en träff,
   bland dem minst en med teckenreferens (`App&#32;Store`, `Kla&#x72;na`), en
   med JS-escape (`Sw\u0069sh`), en med U+00A0 eller mjukt bindestreck mellan
   bokstäverna, en i versaler, och `4,8 av 5`. Varje fall asserterar regel-id.
2. Skanning: `scanPaths` på repot ger noll överträdelser; vid fel skrivs fil,
   regel och träff ut.

Vad spärren **inte** fångar (står också som kommentar överst i
`contentGuard.ts`): text i rasterbilder och video; text som byggs ihop vid
körning (`'App' + 'Store'`, mallsträngar, data från nätet); synonymer och
omskrivningar som inte står i mönstren ("en nöjd boende berättar"); andra
språk än svenska och engelska; logotyper som ritats som SVG-banor utan
igenkännbart filnamn; innehåll i filer utanför omfånget. Granskaren läser
därför varje text i avsnitt 7 och varje mediafil manuellt.

## 8. Media (1.12, 1.14, 1.20, 1.21)

**Lagligt ursprung.** Varje fil under `web/public/media` har exakt ett av
följande ursprung:
1. **Egenproducerad** av byggaren i det här projektet: genererad med
   `ffmpeg-static` (video, poster) eller ritad som SVG i `web/media-src/`,
   rasterad med Playwright och kodad med `ffmpeg-static` (lokalbilder,
   og-image). Licens: projektets egen. Inga riktiga varumärken, inga personer,
   inga riktiga platser.
2. **Fri licens** från Unsplash eller Pexels, eller användarens egna foton/film.
   Används inte i Fas 1 (F7), men får bytas in senare utan kodändring. Raden i `media-credits.md` anger då fotografens namn, länk till
   sidan, licensens namn och hämtningsdatum. Bilden får inte visa logotyper,
   skyltar med företagsnamn, igenkännbara personer eller registreringsskyltar.

Ingen bild eller film genereras med AI-tjänster, och inget hämtas från en
källa utan uttrycklig licens.

**Platshållare i Fas 1** (ursprung 1, enligt F7):

| Fil | Innehåll | Krav |
|-----|----------|------|
| `hero-drone.webm` | Abstrakt, långsam färgrörelse i tokenfärgerna | VP9, 1920×1080, 10-20 s, inget ljudspår, ≤ 5 242 880 byte |
| `hero-drone.mp4` | Samma | H.264, `+faststart`, 1920×1080, 10-20 s, inget ljudspår, ≤ 5 242 880 byte |
| `hero-poster.jpg` | Första bildrutan i videon | JPEG, 1920×1080, ≤ 204 800 byte |
| `premises/<id>-<w>.<ext>` för id `laundry`, `sauna`, `party-room`, w `480`, `800`, `1200`, ext `avif`, `webp`, `jpg` | Enkel illustration av lokalen (tvättmaskin, bastulave, festbord) i tokenfärger, förhållande 3:2 | ≤ 153 600 byte per fil |
| `og-image.jpg` | Logotyp och h1-texten på `neutral-50` | JPEG, 1200×630, ≤ 307 200 byte |

**Skriptet** `web/scripts/media/make-placeholders.mjs`, körs med
`npm run media:placeholders` (K22). Kontrakt:
- Hämtar sökvägen till ffmpeg från `ffmpeg-static` (`import ffmpegPath from 'ffmpeg-static'`)
  och anropar den med `node:child_process` (`spawn`, ingen skalsträng). Inget
  ffmpeg i `PATH` används eller krävs.
- Skapar filerna i tabellen ovan i `web/public/media/`, skriver över
  befintliga, och skriver efter varje fil en rad `<sökväg relativt web/public> <byte>`.
  Skriptet växer per uppgift: i 1.12 skapar det bara hero-filerna, 1.14 lägger
  till lokalbilderna och 1.21 `og-image.jpg`. "Varje fil" nedan betyder de
  filer skriptet skapar efter respektive uppgift.
- Lokalbilderna och `og-image.jpg` rasteras först från SVG:erna i
  `web/media-src/` med Playwright (`page.setContent` + `page.screenshot` till
  PNG i `.scratch/media/`), sedan kodas de med ffmpeg.
- Video: VP9 (`libvpx-vp9`) respektive H.264 (`libx264`), utan ljudspår
  (`-an`). AVIF: `libaom-av1` eller `libsvtav1`.
- Exitkod 0 bara om varje fil skapades och klarar storleksgränsen i tabellen;
  annars 1 med filnamnet och skälet på stderr.
- Saknar ffmpeg-binären från `ffmpeg-static` en kodare ovan (kontrolleras i
  K18) lämnas det tillbaka till arkitekten; byggaren byter inte format själv.

Skriptet körs bara när media ska skapas om, inte i `build` eller i CI. De
genererade filerna checkas in. `web/scripts/media/README.md` innehåller
kommandot och utdatan från den senaste körningen och skrivs först när
körningen gett exit 0. Längd och frånvaro av ljudspår redovisas i 1.12 med
utdata från K21.

`media-files.test.ts` (nod-miljö) kontrollerar, med samma tillväxt som skriptet
(hero-filerna från 1.12, lokalbilderna från 1.14, `og-image.jpg` från 1.21),
för varje fil:
att den finns, storleksgränsen, och filsignaturen (WebM börjar med
`1A 45 DF A3`; MP4 har `ftyp` på byte 4-7; JPEG börjar med `FF D8 FF`; WebP
har `RIFF` på byte 0-3 och `WEBP` på byte 8-11; AVIF har `ftypavif` på byte 4-11) samt
måtten för `hero-poster.jpg` och `og-image.jpg` (läses ur JPEG:ens SOF-markör).

**`docs/media-credits.md`** (1.20) har avsnitten nedan. `## Media` är en tabell med
kolumnerna `Fil | Ursprung | Upphov | Licens | Källa | Datum | Bearbetning`, en
rad per fil, där `Fil` är sökvägen relativt `web/public` (t.ex.
`media/hero-drone.webm`). `## Typsnitt` listar varje typsnitt med licens och
källa. `media-credits.test.ts` jämför mängden `Fil`-värden med mängden filer
under `web/public/media` (rekursivt) och kräver att de är lika, och att varje
rad har icke-tomma `Ursprung`, `Licens` och `Datum`.

## 9. Kvalitetsmätning (1.22, 1.23)

### 9.1 Responsivitet (1.22), K12

`web/playwright.config.ts`: `testDir: './e2e'`, `use.baseURL: 'http://localhost:4173'`,
`webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: false, timeout: 60_000 }`,
ett projekt per bredd: `w375` (375×812), `w768` (768×1024), `w1440` (1440×900),
`channel: 'chrome'` (Chrome finns, K19).

`e2e/responsive.spec.ts`, per projekt (bredd). Kraven skrivs per sida:

| Sida | Förberedelse före mätningen |
|------|-----------------------------|
| `/` | Rulla stegvis till botten tills varje `SectionId` och `sidfot` har monterats, dvs. tills inget element har `aria-busy="true"`. |
| `/integritet` | Ingen (sidan har inga `LazySection`). Vänta på `<h1>`. |
| `/demo` | Ingen (sidan har inga `LazySection`). Vänta på `<h1>`. |

Därefter, för varje sida:
1. Kräv `document.documentElement.scrollWidth <= window.innerWidth`.
2. Kräv för varje `<section>`, `<header>` och `<footer>` som finns på sidan att
   `getBoundingClientRect().right <= window.innerWidth` och `left >= 0`.
3. Spara en helsidesbild i `web/.e2e-output/<sida>-<bredd>.png`.

Redovisningen i 1.22 är en tabell bredd × sektion med "ok" eller fyndet, efter
att byggaren har läst varje helsidesbild.

### 9.2 Lighthouse (1.23), K13

`web/scripts/lighthouse.mjs`, kontrakt:
- Förutsätter att `npm run build` har körts (läser `dist/`).
- Startar `vite preview --port 4173 --strictPort`, väntar högst 30 s på svar från
  `http://localhost:4173/`.
- Kör Lighthouse-CLI:t från `node_modules/.bin` mot `http://localhost:4173/`
  med standardinställningarna (mobil emulering, simulerad strypning),
  `--only-categories=performance,accessibility,best-practices,seo`,
  `--output=json --output=html --output-path=./.lighthouse/landing`,
  `--chrome-flags="--headless=new"`.
- Skriver ut en rad per kategori på formen `performance: 0.97` (kategorins poäng
  med två decimaler) i ordningen performance, accessibility, best-practices, seo.
- Stänger alltid preview-servern.
- Exitkod 0 om varje kategori ≥ 0.90, 1 om någon är lägre, 2 vid infrastrukturfel
  (servern startar inte, Lighthouse kraschar, JSON saknas).

Mätningen görs mot produktionsbygget (`vite build` + `vite preview`), aldrig
mot `npm run dev`. Det som redovisas är den sista körningen: kategoriraderna,
exitkoden och sökvägen till HTML-rapporten. Klarar Performance inte 90 på grund
av heron-videon lämnas det tillbaka till arkitekten; videon får inte göras
lazy eller tas bort utan nytt beslut här.

## 10. `.gitignore` och `.gitattributes` (1.2)

`.gitignore` i roten, grupperad med kommentarer:

```
# .NET
bin/
obj/
.vs/
*.user
*.suo
TestResults/

# Node / webb
node_modules/
web/dist/
web/.lighthouse/
web/.e2e-output/
web/test-results/
web/playwright-report/
web/coverage/

# Miljö och hemligheter
.env
.env.*
!.env.example
**/secrets.json
appsettings.*.local.json
*.pfx
*.p12
*.pem
*.key

# Utredningsskript
.scratch/

# Editor och OS
.idea/
.DS_Store
Thumbs.db

# Checkas inte in (F4, F8)
LARDOMAR.arkiv.md
PROMPT-grannbo.md
.claude/
```

`LARDOMAR.md` (den destillerade versionen med generella regler) **ska**
checkas in och får inte matchas av någon rad i `.gitignore`.

`.gitattributes`: `* text=auto eol=lf`, och `binary` för `*.png *.jpg *.jpeg *.webp *.avif *.webm *.mp4 *.woff *.woff2 *.ico`.
Skäl: Prettier kräver LF; utan regeln ger `prettier --check` fel på en
Windows-utcheckning med `core.autocrlf=true`.

Kontrollen i 1.2: byggaren skapar en tom fil av varje ignorerad sort
(`api/x/bin/a.dll`, `web/node_modules/a.js`, `.env`, `.env.local`,
`a.pfx`, `a.p12`, `a.pem`, `a.key`, `secrets.json`, `.scratch/a.sh`,
`web/.lighthouse/a.json`), visar `git status --porcelain` (inga av dem syns) och
`git check-ignore -v` för var och en, och tar sedan bort filerna. Dessutom:
`git check-ignore -v` ska ge en träff för `LARDOMAR.arkiv.md`,
`PROMPT-grannbo.md` och `.claude/x` (tom fil skapad för kontrollen), och
`git check-ignore LARDOMAR.md` respektive `git check-ignore .env.example` ska
ge exitkod 1 (inte ignorerade), och `git ls-files --error-unmatch LARDOMAR.md`
respektive `git ls-files --error-unmatch .env.example` ska ge exitkod 0
(incheckade). En incheckad och oförändrad fil syns inte i `git status`, så
kravet prövas med de kommandona och inte med `git status`.

## 11. Krav per uppgift

Uppgifterna i körordning, som i `docs/plan.md`: 1.5b körs i P5 efter 1.11,
eftersom den använder `Logo` (1.8) och `EmptyState` (1.10). "Skapar" är filer,
paket och routes som uppgiften lägger till; "Använder" är det den förutsätter, med uppgiften som skapar det.
Ingen uppgift använder något som en senare uppgift skapar. Varje fil i
mappstrukturen har exakt en skapande uppgift; senare uppgifter som ändrar en
fil står under "Använder".

| # | Krav i den här filen | Skapar | Använder |
|---|----------------------|--------|----------|
| 0.1 | Hela filen. K1:s utdata klistras in ordagrant i avsnitt 12. | `docs/ARKITEKTUR.md` | - |
| 1.1 | Avsnitt 1. README-stomme: rubrik `# Grannbo` och, ordagrant, meningen `Grannbo är ett bokningssystem där boende i en bostadsrättsförening bokar gemensamma lokaler (tvättstuga, bastu, festlokal).` (koordinatorns godkännande av byggarens text, 2026-11-20). Inga kommandon. Ingen `docker-compose.yml`. `api/` och `web/` uppstår i 1.3 och 1.5 (git sparar inga tomma kataloger). | `README.md` (stomme), `mobile/README.md` | - |
| 1.2 | Avsnitt 10 och 3.3. | `.gitignore`, `.gitattributes`, `.env.example` | - |
| 1.3 | Avsnitt 2 (.NET-raderna), 5.2, K3-K6. | allt under `api/` utom `Dockerfile` och `.dockerignore` | - |
| 1.4 | Avsnitt 5.3, K14-K17. Får inte märkas klar förrän K14-K16 har körts; Docker Desktop installeras av användaren (A12). Finns Docker inte när 1.3 är klar blir 1.4 ett eget paket, P2b, och P3 får starta under tiden (`docs/plan.md`, "Arbetsgång"). | `api/Dockerfile`, `api/.dockerignore`, `docker-compose.yml` | `api/` (1.3), `.env.example` (1.2) |
| 1.5 | Avsnitt 2 (webbraderna och versionslåsningarna D39-D41), 5.1 (K7-K11, ignoreringslistorna, "Skripten per uppgift", "Kontrollen av skripten i 1.5" med K24-K26, och "Innehåll som 1.5 skapar"), struktur i avsnitt 1. Första testet `src/App.test.tsx`: heading level 1 med namnet "Grannbo". Versioner och avvikelser från create-vite-mallens tsconfig redovisas. | `web/.nvmrc`, `package.json` (skripten `dev`, `build`, `preview`, `lint`, `format`, `format:check`, `test`), `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `index.html` (`lang`, `charset`, `viewport`, `<title>`), `src/main.tsx` (slutlig form), `src/App.tsx`, `src/App.test.tsx`, `src/styles/index.css` (`@import 'tailwindcss';`), `src/test/setup.ts` (bara jest-dom) | - |
| 1.6 | Avsnitt 5.4. Kräver push till remote `origin` (F4) och en grön körning av båda jobben på GitHub, med körningens resultat redovisat. | `.github/workflows/ci.yml` | `api/` (1.3), `web/` (1.5) |
| 1.7 | Avsnitt 4.1-4.4, 4.2 (alla par T1-T19, N1-N5 och X1), K23. Typsnitt: Fraunces och Inter (F5). Avsnitt 5.1 "Typkontroll och lint av alla kataloger (1.7)": tsconfig-filerna och `eslint.config.js` får exakt det innehåll som står där, och `tsconfig.test.json` checkas in i samma commit som första filen i `tests/`. Klar när: K27 ger EXIT≠0 med `TS2322` för varje fall i tabellen (`src/`, `tests/`, `e2e/`, `vite.config.ts`, `playwright.config.ts`), K28 ger EXIT≠0 med `no-unused-vars` och utan `no-undef`, och därefter ger K8–K11 EXIT=0 i `web/`, med utdata inklistrad. | `src/styles/tokens.css`, `tests/support/contrast.ts`, `tests/tokens-contrast.test.ts`, `tsconfig.test.json`, paketen `@fontsource-variable/fraunces` och `@fontsource-variable/inter` | `index.css`, `main.tsx`, `tsconfig.json`, `tsconfig.node.json`, `eslint.config.js` (1.5) |
| 1.8 | Avsnitt 4.5 (A3, A13). Favicon-raden i `index.html` (7.10). | `src/components/brand/Logo.tsx`, `Logo.test.tsx`, `tests/logo-colors.test.ts`, `public/favicon.svg`, `docs/brand/logo-source.pdf`, `docs/brand/logo-source.png`, paketet `@playwright/test` | `tokens.css` (1.7), `index.html` (1.5) |
| 1.9 | Avsnitt 6.1, 6.2. `ButtonLink` med `to` renderar React Routers `<Link>`, så paketet installeras här, och testerna renderar i `MemoryRouter`. | `src/lib/cn.ts`, `ui/Button.tsx`, `ui/Input.tsx` (+ tester), `ui/index.ts`, paketet `react-router` | `tokens.css` (1.7) |
| 1.10 | Avsnitt 6.3-6.6. | `ui/Card.tsx`, `ui/Badge.tsx`, `ui/Skeleton.tsx`, `ui/EmptyState.tsx` (+ tester) | `cn`, `ui/index.ts` (1.9) |
| 1.11 | Avsnitt 6.7, 6.8. | `ui/Toast.tsx`, `ui/Accordion.tsx` (+ tester), ikonerna chevron och stäng i `components/icons/` | `cn`, `ui/index.ts` (1.9) |
| 1.5b | **App-skal: router, SiteHeader, LandingPage, /demo-platshållare.** Körs här (P5). Routerna `/`, `/demo` och `*` ur 5.6; `/integritet` läggs till i 1.19. `App.tsx` får `RouterProvider`. `SiteHeader` enligt 5.6 med `Logo`. `LandingPage`: `SiteHeader tone="onDark"` + `<main id="innehall">` med `<h1>Grannbo</h1>` (ersätts av heron i 1.12). `DemoPlaceholderPage` och `NotFoundPage` i sin slutliga form enligt 7.9 (med `EmptyState`). Footern läggs till på sidorna i 1.19. Tester: `/` renderar `LandingPage` med `SiteHeader`; `/demo` och en okänd sökväg renderar sin `<h1>` och länken `Till startsidan`; hoppa-länken pekar på `#innehall`; varje sida sätter sin `<title>` ur 5.6. | `src/components/layout/SiteHeader.tsx` (+ test), `src/features/landing/LandingPage.tsx` (+ test), `src/features/demo/DemoPlaceholderPage.tsx` (+ test), `src/features/errors/NotFoundPage.tsx` (+ test) | `App.tsx` (1.5), `Logo` (1.8), `ButtonLink` och `react-router` (1.9), `EmptyState` (1.10) |
| 1.12 | Avsnitt 7.1; avsnitt 8 bara för hero-filerna (`hero-drone.webm`, `hero-drone.mp4`, `hero-poster.jpg`); K18, K21, K22. `make-placeholders.mjs` skapar i 1.12 bara hero-filerna, och `media-files.test.ts` kontrollerar bara dem. Preload-raden för postern i `index.html`. | `sections/Hero.tsx` (+ test), `heroMedia.ts` (+ test), `content.ts` (`HERO`, `SECTION_IDS`), ikonerna paus och spela, `scripts/media/make-placeholders.mjs`, `scripts/media/README.md`, `tests/media-files.test.ts`, hero-filerna, paketet `ffmpeg-static` | `LandingPage` (1.5b), `/demo` (1.5b), `Button`/`ButtonLink` (1.9), `tokens.css` (1.7) |
| 1.13 | Avsnitt 7.2, 6.9 (LazySection). | `LazySection.tsx` (+ test), `sections/HowItWorks.tsx` (+ test), stegikonerna | `LandingPage` (1.5b), `Skeleton` (1.10), `content.ts` (1.12) |
| 1.14 | Avsnitt 7.3, 6.9 (ResponsiveImage), avsnitt 8 för lokalbilderna; skriptet och `media-files.test.ts` utökas med dem. K22. | `sections/Premises.tsx` (+ test), `components/media/ResponsiveImage.tsx` (+ test), `media-src/premises/*.svg`, `public/media/premises/*` | `LazySection` (1.13), `Card` (1.10), skriptet och testet (1.12), Playwright (1.8) |
| 1.15 | Avsnitt 7.4. | `sections/ForBoard.tsx` (+ test) | `LazySection` (1.13), `Badge` (1.10) |
| 1.16 | Avsnitt 7.5. | `sections/MobileApp.tsx` (+ test) | `LazySection` (1.13), `Badge` (1.10) |
| 1.17 | Avsnitt 7.6 (innehållet enligt F6). | `sections/Pricing.tsx` (+ test) | `LazySection` (1.13), `Card`, `Badge` (1.10), `ButtonLink` (1.9) |
| 1.18 | Avsnitt 7.7. | `sections/Faq.tsx` (+ test) | `LazySection` (1.13), `Accordion` (1.11) |
| 1.19 | Avsnitt 7.8, 7.9 (raden enligt F1, A6). Sidan `/integritet` och dess route skapas här. `SiteFooter` läggs till på alla sidor: på `/` i `<LazySection id="sidfot">`, på övriga direkt. | `components/layout/SiteFooter.tsx`, `features/legal/PrivacyPage.tsx` (+ tester) | `App.tsx` (1.5), `LandingPage`, `DemoPlaceholderPage`, `NotFoundPage` (1.5b), `LazySection` (1.13), `Logo` (1.8) |
| 1.20 | Avsnitt 8 (`media-credits.md`). | `docs/media-credits.md`, `tests/media-credits.test.ts` | mediefilerna (1.12, 1.14) |
| 1.21 | Avsnitt 7.10, 7.11, avsnitt 8 för `og-image.jpg`; skriptet och `media-files.test.ts` utökas med den, och `media-credits.md` får dess rad. K22. | `public/robots.txt`, `media-src/og-image.svg`, `public/media/og-image.jpg`, `tests/seo-meta.test.ts`, `tests/support/contentGuard.ts`, `tests/content-guard.test.ts` | `index.html` (1.5), skriptet (1.12), `media-credits.md` (1.20), Playwright (1.8) |
| 1.22 | Avsnitt 9.1, K12, K19. | `playwright.config.ts`, `e2e/responsive.spec.ts` | Playwright (1.8), alla sidor (1.5b-1.19) |
| 1.23 | Avsnitt 9.2, K13, K19. | `scripts/lighthouse.mjs`, paketet `lighthouse` | produktionsbygget (1.5) |
| 1.24 | Bara kommandon med status "körd, exit 0" i avsnitt 12 får stå i README. | - | `README.md` (stommen från 1.1, skrivs om med Fas 1-innehåll) |

## 12. Verifieringsstatus (den enda platsen för "körd/okörd")

| Id | Kommando | Status |
|----|----------|--------|
| K1 | `dotnet --list-sdks` | Körd av koordinatorn 2026-11-20 (inte av arkitekten, som saknar skal i det här steget). Utdata ordagrant i blocket under tabellen. .NET 10-SDK finns (A8). |
| K2 | `node -v`, `npm -v` | Körd av koordinatorn 2026-11-20: `v24.19.0`, `11.17.0`. |
| K3 | `dotnet restore Grannbo.slnx --locked-mode` | Körd av byggaren 2026-11-20 i 1.3: EXIT=0, även med `--locked-mode`. Låsta versioner: Serilog.AspNetCore 11.0.0, xunit.runner.visualstudio 4.0.1, Microsoft.NET.Test.Sdk 18.12.0, Microsoft.AspNetCore.Mvc.Testing 10.0.15 (11.0.0 finns bara för net11.0). Testpaketet `xunit.v3.mtp-off` 4.0.3 (D37). |
| K4 | `dotnet build Grannbo.slnx -c Release --no-restore` | Körd av byggaren 2026-11-20 i 1.3: EXIT=0, 0 varningar. |
| K5 | `dotnet format Grannbo.slnx --verify-no-changes --no-restore` | Körd av byggaren 2026-11-20 i 1.3: EXIT=0. `.slnx` gick att läsa. |
| K6 | `dotnet test Grannbo.slnx -c Release --no-build` | Med `xunit.v3` 4.0.3 gav K6 EXIT=1 (felet i D37). Med `xunit.v3.mtp-off` 4.0.3 i en kopia gav den 13/13 godkända och EXIT=0. Körd av byggaren 2026-11-20 i 1.3 med `xunit.v3.mtp-off` 4.0.3 (D37): Passed 13, Failed 0, EXIT=0 (commit 2c7b95c). |
| K7-K11 | webbkommandona | Körda av byggaren 2026-11-20 i 1.5 (commit 0ea4b4a): alla gav EXIT=0; K11 gav 1 passed, 0 failed. K8 och K9 gav EXIT=0 även när de kördes efter K10. Körs igen i varje senare webbuppgift. |
| K12 | `npm run test:e2e` | Okörd. Körs i 1.22. |
| K13 | `npm run lighthouse` | Okörd. Körs i 1.23. |
| K14-K17 | Compose | Okörda. `docker` saknas (koordinatorn 2026-11-20: `docker: command not found`). Körs i 1.4 när användaren har installerat Docker Desktop (A12). |
| K18 | Kodarna i `ffmpeg-static` (från `web/`, efter att paketet installerats): `timeout 60 node -e "require('child_process').spawnSync(require('ffmpeg-static'),['-hide_banner','-encoders'],{stdio:'inherit'})"` | Systemets ffmpeg: körd av koordinatorn 2026-11-20, `ffmpeg -version` gav `ffmpeg: command not found`. Därför används `ffmpeg-static` (F7). Kommandot till vänster är okört och körs före 1.12. Utdatan ska innehålla `libvpx-vp9`, `libx264` och `libaom-av1` eller `libsvtav1`; annars lämnas det tillbaka till arkitekten. |
| K19 | Finns Chrome: `Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"` | Kontrollerad av koordinatorn 2026-11-20: Chrome finns på `C:\Program Files\Google\Chrome\Application\chrome.exe`. Playwright använder `channel: 'chrome'`. |
| K20 | `git check-ignore -v <fil>` per fil i avsnitt 10 | Körd av byggaren 2026-11-20 i 1.2 (P1, commit 6b6ecde). Alla 14 filer som ska ignoreras gav exit 0, bland dem `LARDOMAR.arkiv.md`, `PROMPT-grannbo.md` och `.claude/x`. `LARDOMAR.md` och `.env.example` gav exit 1. `git status --short --ignored` efter sista commit visade bara `!! LARDOMAR.arkiv.md` och `!! PROMPT-grannbo.md`. |
| K21 | Längd och strömmar (från `web/`): `timeout 120 node -e "require('child_process').spawnSync(require('ffmpeg-static'),['-hide_banner','-i',process.argv[1],'-f','null','-'],{stdio:'inherit'})" public/media/hero-drone.<ext>` | Okörd. Körs i 1.12 för `webm` och `mp4`. Utdatan ska visa `Duration` mellan 10 och 20 s och ingen rad `Stream ... Audio`. (ffprobe ingår inte i `ffmpeg-static`.) |
| K22 | `npm run media:placeholders` | Okörd. Körs i 1.12 (hero-filerna), 1.14 (lokalbilderna) och 1.21 (`og-image.jpg`). |
| K23 | Kontrastkvoter för basfärgerna, WCAG-formeln i Node | Uträknade av koordinatorn 2026-11-20: `#E38B5C`/`#F4F6F9` = 2.39; `#E38B5C`/`#1B2A41` = 5.58; `#9A4A28`/`#F4F6F9` = 5.73; `#1B2A41`/`#F4F6F9` = 13.34; `#475569`/`#F4F6F9` = 7.00. Avrundade till två decimaler; ingen av dem ligger nära en gräns. Testet i 1.7 räknar om dem oavrundade (par X1, T19, T8, T1, T3). |
| K24-K26 | `dev`, `preview` och `format` med kontrollerna i 5.1 | Körda av byggaren 2026-11-20 i 1.5: K25 gav 200 och K26 EXIT=0. K24 gav 200 på port 5174 med `--strictPort`, eftersom 5173 var upptagen av en annan process; koordinatorn godtog det som belägg, och K24 skrivs sedan dess med `<ledig port>` (5.1). |
| K27 | Typkontrollens täckning: sonden `export const typeErrProbe: number = 'text';` per fall i `.scratch/tc`, sedan `timeout 600 npm run build` (5.1, "Beviset i 1.7") | Okörd (arkitekten hade inget skal 2026-11-20). Körs i 1.7. Krav: EXIT≠0 och `TS2322` med filens sökväg för varje fall. Granskarens körning i P3 (före ändringen): sonden i `tests/typeerr.test.ts` gav EXIT=0 i K8, K10 och K11 (LARDOMAR.md, posten om P3). |
| K28 | Lint av `.mjs`: `scripts/probe.mjs` i `.scratch/tc`, sedan `timeout 300 npm run lint` (5.1, "Beviset i 1.7") | Okörd (arkitekten hade inget skal 2026-11-20). Körs i 1.7. Krav: EXIT≠0, `no-unused-vars` i utdatan och inget `no-undef`. |
| - | Låsta webbversioner | Låsta av byggaren 2026-11-20 i 1.5 (`--save-exact`): react och react-dom 19.3.1, vite 8.3.8, @vitejs/plugin-react 6.3.0, typescript 6.0.3, tailwindcss och @tailwindcss/vite 4.3.5, eslint och @eslint/js 9.39.5, typescript-eslint 8.73.0, eslint-plugin-react-hooks 7.1.1, eslint-plugin-react-refresh 0.5.8, eslint-plugin-jsx-a11y 6.10.2, globals 17.14.0, eslint-config-prettier 10.1.8, prettier 3.10.1, vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, @types/react och @types/react-dom 19.3.0, @types/node 24.19.2. |
| - | Versionslåsningar | Kontrollerade av byggaren 2026-11-20 med `npm view` och provinstallation: ESLint 10 med `eslint-plugin-jsx-a11y` 6.10.2 gav ERESOLVE, EXIT=1 (D39); `typescript-eslint` 8.73.0 kräver TypeScript `>=4.8.4 <6.1.0` (D40). |
| - | Docker | Koordinatorn 2026-11-20: inte installerat än. Användaren installerar Docker Desktop själv. Se K14-K17. |
| - | `git remote -v` | Koordinatorn 2026-11-20: remote `origin` finns och pekar på ett tomt GitHub-repo (adressen står bara i `docs/decisions.md` F4). `gh` saknas. |

K1, utdata ordagrant (körd av koordinatorn 2026-11-20):

```
8.0.414 [C:\Program Files\dotnet\sdk]
9.0.317 [C:\Program Files\dotnet\sdk]
10.0.302 [C:\Program Files\dotnet\sdk]
```

## 13. Öppna frågor som den här filen väcker

Inga öppna frågor för Fas 1. F1, F2 och F4-F8 i `docs/decisions.md` är
besvarade och inarbetade: F1 i 7.8, F2 och A13 i 4.5, F4 och F8 i avsnitt 10,
F5 i 4.3, F6 i 7.6, F7 i avsnitt 8.

Kvar är förutsättningar som inte är öppna frågor:
- Docker (A12): användaren installerar Docker Desktop själv. Det strider inte
  mot F7, som bara gällde ffmpeg. Docker behövs för K14-K17 i 1.4. Finns Docker
  inte när 1.3 är klar blir 1.4 ett eget paket, P2b, och P3 får starta under
  tiden (`docs/plan.md`, "Arbetsgång").
- Kodarna i `ffmpeg-static` (K18) är okontrollerade. Fallerar kontrollen lämnas
  det tillbaka till arkitekten. (Frågan om `dotnet format` och `.slnx` stängdes
  i 1.3, se K5.)

## Beslutslogg

- D1: Arkitekturen ligger i `docs/ARKITEKTUR.md`. Specen (avsnitt 1) säger att
  arkitektur ligger i `/docs`. (påverkat av lärdom: nej)
- D2: Varje kommando har ett id, och om det är kört står bara i avsnitt 12.
  Inget kommando är kört av arkitekten. (påverkat av lärdom: ja, LARDOMAR.md:
  "först när det har körts i den här miljön med exit 0")
- D3: `docker-compose.yml` skapas i 1.4, när API:t finns, och 1.4 märks inte
  klar utan körd Compose. (påverkat av lärdom: ja, LARDOMAR.md: "ett
  skapande-nummer högre än uppgiftens eget är ett fel")
- D4: Varje landningstext står ordagrant här, och tester skriver förväntade
  texter som litteraler. (påverkat av lärdom: ja, LARDOMAR.md: "Byggaren fattar
  inga egna beslut." och "Jämför svaret mot en literal i testfilen")
- D5: Kontrasttestet jämför oavrundade kvoter och skriver ut sex decimaler.
  De enda kvoter som står i den här filen är koordinatorns uträknade värden i
  K23, med två decimaler och långt från gränserna. (påverkat av lärdom: ja,
  LARDOMAR.md: "Ett påstående om exakthet eller en gräns")
- D6: Tankstreck i specens tider skrivs `\u2013` i källa och tester.
  (påverkat av lärdom: ja, LARDOMAR.md: "Osynliga tecken (U+00A0, U+2212,
  U+FEFF, U+200B) skrivs alltid som escape"; regeln tillämpas här även på
  U+2013)
- D7: Typsnitt: Fraunces för rubriker och Inter för brödtext, båda via
  `@fontsource-variable` (F5). Båda är OFL, så licensen tillåter spridning
  utan vidare prövning.
  (påverkat av lärdom: nej)
- D8: Tailwind 4 med `@theme` som "Tailwind-konfigen", med nollställda
  standardfärger, -typsnitt, -radier och -skuggor så att bara våra tokens
  finns. Varje token i 4.1 har en användning angiven. (påverkat av lärdom: ja,
  LARDOMAR.md: "Sök efter anropare för varje publik medlem före överlämning.")
- D9: TanStack Query och Framer Motion installeras inte i Fas 1; de ingår i
  stacken men har ingen användning förrän senare. (påverkat av lärdom: nej;
  arkitektens regel att inte bygga för framtiden)
- D10: Input och Toast byggs (specen kräver dem) men har ingen anropare i Fas 1;
  det står i deras gränssnittsblock med skäl. (påverkat av lärdom: ja,
  LARDOMAR.md: "Sök efter anropare för varje publik medlem före överlämning.")
- D11: "Testa demon" leder till `/demo`, en sida som ärligt säger att demon inte
  är öppen än. Alla länkar ska gå till sidor som finns, och demon byggs i
  Fas 3-4. (påverkat av lärdom: nej)
- D12: Lazy loading nedanför heron sker per sektion med `React.lazy`, men alla
  sektioner monteras senast när sidan laddat färdigt, så att tangentbord och
  skärmläsare når hela sidan. Bilder nedanför heron har `loading="lazy"`.
  Heron importeras direkt och har varken lazy-bilder eller fördröjd video.
  (påverkat av lärdom: nej)
- D13: Heron har en pausknapp för videon. Specen kräver tillgänglighet, och
  WCAG 2.2.2 kräver paus för automatisk rörelse längre än 5 s. (påverkat av
  lärdom: nej)
- D14: `navigator.connection` saknas i Safari och Firefox; då visas video
  (postern syns tills videon spelas). Långsam = `saveData` eller
  `effectiveType` `slow-2g`, `2g` eller `3g`. (påverkat av lärdom: nej)
- D15: Platshållarmedia i Fas 1 är egenproducerade (F7), skapade med
  devberoendet `ffmpeg-static` via `npm run media:placeholders` och egna SVG.
  Ingen programvara installeras i systemet, ingen AI-generering och inga
  nedladdningar utan licens. (påverkat av lärdom: ja, LARDOMAR.md: "först när
  det har körts i den här miljön med exit 0"; systemets ffmpeg saknades, K18)
- D16: Spärren i 1.21 normaliserar teckenreferenser, JS-escapes, osynliga tecken
  och blanktecken, har mönster per roll med minst tre stavningar i testet, och
  har ett avsnitt om vad den inte fångar. (påverkat av lärdom: ja,
  LARDOMAR.md: "En textspärr prövas med varje stavning språket tillåter")
- D17: `.gitattributes` med LF, så att radslut inte skiljer sig mellan Windows
  och CI. (påverkat av lärdom: ja, LARDOMAR.md: "Misstänks radslut: jämför
  `git diff` med `git diff -w`.")
- D18: Alla körningar har yttre tidsgräns, i CI via `timeout-minutes`.
  (påverkat av lärdom: ja, LARDOMAR.md: "Varje körning en agent startar har en
  yttre tidsgräns")
- D19: Playwright och Lighthouse körs lokalt i Fas 1, inte i CI. Specen kräver
  bygge, lint och test i CI; Lighthouse-kravet gäller fasen, inte varje PR.
  (påverkat av lärdom: nej)
- D20: Tester läser aldrig `.env`, user-secrets eller en databas; API-testerna
  körs i minnet i miljön `Testing`. (påverkat av lärdom: nej; kravet kommer
  från `docs/plan.md` och specens "inga hemligheter i repot")
- D21: Det finns ingen vektorkälla till logotypen. `K4 · Rutnätet.pdf`
  innehåller bara en inbäddad JPEG (koordinatorns beslut 2026-11-20): den
  bilden är facit för formen, och byggaren mäter rutnätets geometri i den och
  ritar SVG:n efter måtten (4.5). `K4 · Rutnätet@1x.png` är facit för färgerna
  (F2, A13). Båda filerna kopieras oförändrade till `docs/brand/`. Inga mått på
  bilderna skrivs här; byggaren redovisar dem i 1.8 med kommandot som mätte
  dem. (påverkat av
  lärdom: ja, LARDOMAR.md: "Ett mått eller antal i ARKITEKTUR.md skrivs bara
  tillsammans med kommandot som mätte det")
- D22: `postgres:17-alpine` i stället för 18, för att datavolymens sökväg i 18
  har ändrats. (påverkat av lärdom: nej)
- D23: Färgerna utgår från logotypens uppmätta värden (A1, användarens krav):
  `#1B2A41`, `#E38B5C`, `#C9D2DE`, bakgrund `#F4F6F9`, sekundär text `#475569`.
  Bakgrunden är logotypens kalla ljusgrå och inte specens "varma off-white";
  användaren har bestämt att logotypen går före specen här. Tokennamnen är
  `primary-*`, `accent-*` och `neutral-*` med basvärdet på ett fast steg.
  (påverkat av lärdom: nej)
- D24: `accent-500` får inte vara text i någon storlek på ljus botten, inte heller
  stor text, eftersom även stor text kräver 3:1. Text i accent på ljus botten
  använder `accent-700` (`#9A4A28`), som är med i kontrasttestet (T8-T10).
  Paret X1 i testet dokumenterar varför (A11). (påverkat av lärdom: ja,
  LARDOMAR.md: "Ett påstående om exakthet eller en gräns")
- D25: Footerns rad är `Grannbo är ett portfolioprojekt. Brf Solgläntan är en
  fiktiv förening.` utan namn (F1, A6). "[mitt namn]" står bara kvar i den
  mening i 7.8 som säger att specens platshållare inte gäller. (påverkat av
  lärdom: ja, LARDOMAR.md: "Byter användaren ett begrepp: sök det")
- D26: `LARDOMAR.arkiv.md`, `PROMPT-grannbo.md` och `.claude/` ignoreras, och
  `LARDOMAR.md` checkas in (F4, F8). Den här filen hänvisar bara till
  `LARDOMAR.md`. (påverkat av lärdom: nej)
- D27: Prisplanen har innehållet i 7.6 (F6), märkt som exempel och utan
  betalningsväg (A10). (påverkat av lärdom: nej)
- D28: Lokalkorten (7.3) avviker från specens tabell i en cell: `Veckovis (se
  nedan)` blir `Veckovis. Bokningen för nästa vecka öppnar på söndagen.`.
  "(se nedan)" hänvisar i specen till punktlistan under tabellen, som inte står
  på kortet; den ordagranna texten skulle peka på något som inte finns.
  Ersättningen är hämtad ur samma punktlista. (påverkat av lärdom: nej)
- D29: Uppgift 1.5b (app-skal: router, `SiteHeader`, `LandingPage`, `/demo` och
  404) körs i P5 efter 1.11, eftersom den använder `Logo` (1.8), `ButtonLink`
  (1.9) och `EmptyState` (1.10), och före 1.12, eftersom heron länkar till
  `/demo`. `react-router` installeras i 1.9, där `ButtonLink` behöver det.
  `/integritet` skapas i 1.19. Avsnitt 11 listar för varje uppgift vad den
  skapar och använder. (påverkat av lärdom: ja, LARDOMAR.md: "ett
  skapande-nummer högre än uppgiftens eget är ett fel")
- D30: API:t svarar 404 och 500 med svenska titlar ur namngivna konstanter
  (`ProblemTexts`), och testerna jämför med litteraler. Kravet på 400 för en
  otolkbar förfrågan avfärdas för Fas 1: ingen endpoint läser en kropp eller
  parametrar. Kravet på ett svenskt besked vid fel vid uppstart avfärdas för
  Fas 1: API:t har ingen databaskoppling och startas bara av Compose och
  testerna; det tas upp när databasanslutningen tillkommer i Fas 2.
  (påverkat av lärdom: ja, LARDOMAR.md: "Inget undantag når användaren rått:
  en global felhanterare svarar 500 med en" och "Fel vid uppstart (port
  upptagen, databas nås inte) ger ett kort svenskt besked")
- D31: Footern lazy-loadas på landningssidan genom `LazySection` med id
  `sidfot` (`LazyRegionId`, 6.9), eftersom specen säger "lazy-loada allt
  nedanför" heron och footern är punkt 8 i specens lista över
  landningssidan. På övriga sidor renderas den direkt; där finns ingen hero.
  Valt framför en egen omslutning, eftersom `LazySection` redan har ett
  gränssnitt och testas. (påverkat av lärdom: ja, LARDOMAR.md: `"X-liknande" är inget
  gränssnitt`)
- D32: Innehållet i `web/.prettierignore` och ESLints `globalIgnores` står i
  5.1, och samma genererade kataloger står i `.gitignore`. (påverkat av lärdom:
  ja, LARDOMAR.md: "Varje konfigurationsfil i mappstrukturen har sitt innehåll
  angivet i ARKITEKTUR.md.")
- D33: Inga användarnamn, lokala sökvägar med användarnamn eller repo-URL står
  i den här filen; källfilerna anges som "användarens skrivbord" och repot som
  "remote `origin`". (påverkat av lärdom: ja, LARDOMAR.md: "Repo-URL:en får
  bara stå i `docs/decisions.md` F4.")
- D34: Kraven i 9.1 och miljön för testerna i `web/tests/` skrivs per sida
  respektive per fil. (påverkat av lärdom: ja, LARDOMAR.md: "skriv kravet per
  sida/fil")
- D35: Inga antal i löptext när uppräkningen står i filen (t.ex. ikonerna).
  (påverkat av lärdom: ja, LARDOMAR.md: "antal skrivs inte alls när
  uppräkningen står i samma fil")
- D36: Docker installeras av användaren (A12). 1.4 bockas inte av förrän
  K14-K16 har körts; finns Docker inte när 1.3 är klar blir 1.4 paketet P2b
  enligt planen. (påverkat av lärdom: nej)
- D37: Testprojektet använder `xunit.v3.mtp-off` 4.0.3 i stället för
  `xunit.v3` (koordinatorns beslut 2026-11-20, väg a). Skäl: `xunit.v3` 4.0.3
  drar in Microsoft.Testing.Platform v2, och då vägrade .NET 10-SDK:n köra K6
  med felet "Testing with VSTest target is no longer supported by
  Microsoft.Testing.Platform on .NET 10 SDK and later" (EXIT=1, körd av
  byggaren 2026-11-20 i 1.3). Med `xunit.v3.mtp-off` 4.0.3 gav K6 13/13
  godkända och EXIT=0 i en kopia. Väg a behåller senaste xUnit och kräver
  ingen ändring av K6 eller `global.json`. Bortvalt: `xunit.v3` 3.2.2 (gav
  också 13/13 och EXIT=0, men är en äldre version) och
  `global.json` med `test.runner` = `Microsoft.Testing.Platform` (oprovad).
  (påverkat av lärdom: ja, LARDOMAR.md: "först när det har körts i den här
  miljön med exit 0")
- D38: `api/.editorconfig` har innehållet i 5.2 med `end_of_line = lf`. Utan
  filen krävde `dotnet format` CRLF på Windows, medan `.gitattributes` kräver
  LF (byggarens fynd i 1.3). (påverkat av lärdom: ja, LARDOMAR.md: "Varje
  konfigurationsfil i mappstrukturen har sitt innehåll angivet i
  ARKITEKTUR.md.")
- D39: `eslint` och `@eslint/js` låses till 9.39.5 (koordinatorns beslut
  2026-11-20). Skäl: ESLint 10 kan inte installeras med
  `eslint-plugin-jsx-a11y` 6.10.2, vars peer-krav är `^3 … || ^9`; npm gav
  ERESOLVE, EXIT=1 (byggarens provinstallation 2026-11-20). Varningen om att
  9.39.5 är deprecated accepteras, eftersom jsx-a11y behövs för WCAG. Ingen
  `--legacy-peer-deps`. (påverkat av lärdom: ja, LARDOMAR.md: "först när det
  har körts i den här miljön med exit 0")
- D40: TypeScript låses till 6.0.3 (koordinatorns beslut 2026-11-20). Skäl:
  `typescript-eslint` 8.73.0 kräver TypeScript `>=4.8.4 <6.1.0`, så TS 7.0.2
  fungerar inte. (påverkat av lärdom: nej)
- D41: `@types/node` installeras med `--save-exact` i en exakt version inom
  `^24` (24.19.2 i 1.5), eftersom projektet kör Node 24 (`web/.nvmrc`).
  (påverkat av lärdom: nej)
- D42: `src/test/setup.ts` innehåller bara jest-dom. Stubbar för `matchMedia`
  och `IntersectionObserver` läggs i de testfiler som behöver dem, med start i
  1.12 och 1.13. Skäl: en global stub för `IntersectionObserver` skulle göra
  fall (d) i 6.9 ("`IntersectionObserver` saknas - då monteras den direkt")
  omöjligt att testa, och en stub ska inte ligga i en uppgift som inte använder
  den. (påverkat av lärdom: ja, LARDOMAR.md: "skriv kravet per sida/fil")
- D43: Innehållet i filerna som 1.5 skapar (`.prettierrc.json`, `setup.ts`,
  `App.tsx`, `index.html`, `main.tsx`, tsconfig-filerna och `eslint.config.js`)
  och skriptens fördelning per uppgift står i 5.1 (koordinatorns beslut
  2026-11-20, efter att byggaren lämnat tillbaka 1.5). (påverkat av lärdom: ja,
  LARDOMAR.md: "Byggaren fattar inga egna beslut.")
- D44: `tests/` och `e2e/` typkontrolleras av ett eget projekt,
  `tsconfig.test.json`, och `playwright.config.ts` läggs till i `include` i
  `tsconfig.node.json`; alla byggs av `tsc -b` i K10, som redan körs i CI, så
  inget nytt skript eller CI-steg behövs (5.1, 5.4). Eget projekt i stället för
  att utöka `tsconfig.app.json`, eftersom testkoden körs i Node och behöver
  `node`-typer som webbläsarkoden i `src/` inte ska få; i stället för att utöka
  `tsconfig.node.json`, eftersom testkoden också behöver DOM-typer
  (`DOMParser`, `page.evaluate`) som konfigurationsfilerna inte ska ha.
  Ändringen görs som tillägg i 1.7 och inte som en egen uppgift före 1.7: 1.7
  skapar de första filerna i `tests/`, och ett projekt helt utan indatafiler
  kan ge TS18003 i `tsc -b` (ej körd). Beviset är K27 per katalog i en kopia.
  Bortvalt: ett separat `typecheck`-skript (dubblerar `tsc -b` i K10);
  `vitest --typecheck` (täcker inte `e2e/` eller `playwright.config.ts`).
  (påverkat av lärdom: ja, LARDOMAR.md: "Varje katalog i ARKITEKTUR avsnitt 1
  som innehåller `.ts`/`.tsx` ... ska ingå i `include` i exakt en tsconfig som
  `tsc -b` bygger")
- D45: SDK-versionen i CI låses inte; risken att K3/K4 blir röd utan
  kodändring accepteras för Fas 1, med åtgärden i 5.4. Skäl: en låsning
  måste gälla lokalt (10.0.302, K1), i CI och i Docker-avbildningen
  `sdk:10.0` (1.4, okörd), och vilken SDK-version avbildningen och
  GitHub-löparens förinstallerade SDK:er har är inte kontrollerat; en exakt
  version i `global.json` kan därför stoppa 1.4, vilket var skälet till
  `10.0.100` + `latestFeature` (avsnitt 2). NuGetAudit (NU1901–NU1904) låses
  inte heller bort: en ny sårbarhet i ett låst paket är ett riktigt fel i
  beroendena, inte ett slumpmässigt utfall, och att låsa SDK:n skulle inte
  ändra det, eftersom sårbarhetsdatat hämtas vid varje restore. Bortvalt:
  `dotnet-version: '10.0.302'` utan ändrad `global.json` (`latestFeature` väljer
  den högsta installerade 10.0-SDK:n, och vilka som är förinstallerade på
  löparen är inte kontrollerat); `WarningsNotAsErrors` för NU190x (döljer sårbarheter).
  (påverkat av lärdom: ja, LARDOMAR.md: "Ett test som kan bli rött på
  oförändrad kod är ett fel." – avvägt: regeln gäller tester, och utfallet
  här beror på en ändrad omvärld, inte på slump)
- D46: `eslint.config.js` får ett eget konfigurationsobjekt för
  `**/*.{js,mjs}` med `js.configs.recommended` och `globals.node`, i 1.7
  tillsammans med D44, så att det finns innan första `.mjs`-skriptet skrivs i
  1.12. Skäl: i konfigurationen från 1.5 gällde alla regler bara
  `files: ['**/*.{ts,tsx}']`, så `.js`/`.mjs` fick inga regler alls
  (granskarens fynd i P3), och `scripts/` körs i Node. Beviset är K28. Bortvalt: att lägga till det i
  1.12 (då ligger `eslint.config.js` oprövad till dess, och 1.12 får en
  leverans till); `globals.browser` för `.js` (inga webbläsar-`.js` finns i
  avsnitt 1). (påverkat av lärdom: nej)
