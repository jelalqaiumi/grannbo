# Plan: Grannbo – bokningssystem för bostadsrättsföreningar, byggt i sex faser enligt PROMPT-grannbo.md

Källa: `PROMPT-grannbo.md` (specen). Antaganden, beslut och frågor finns i
`docs/decisions.md`, och krav per uppgift i `docs/ARKITEKTUR.md` avsnitt 11.
Varje uppgift bockas av här när den är klar.

## Lärdomar som gäller här

Varje punkt citerar en regel som finns i `LARDOMAR.md`.

- **"Nästa paket startar först när granskarens skriftliga besked (godkänt eller
  tillbaka) om föregående paket finns."** Granskningen görs per arbetspaket.
  Beslutet om det står under "Arbetsgång".
- **"Byggaren fattar inga egna beslut."** Fall som varken specen eller
  `docs/ARKITEKTUR.md` avgör lämnas tillbaka till arkitekten.
- **"Ändras vad ett paket ska leverera skrivs hela paketets rad i `docs/plan.md`
  om, både 'Uppgift' och 'Klar när', i samma ändring."** Det gäller också när
  `docs/ARKITEKTUR.md` ändrar en leverans. Därför hänvisar raderna nedan till
  arkitekturens avsnitt i stället för att upprepa detaljer.
- **"Ett kommando får skrivas in i `docs/ARKITEKTUR.md`, README, CI eller
  `package.json` först när det har körts i den här miljön med exit 0."** Gäller
  alla "Klar när" som kräver grönt, även Compose (1.4) och Lighthouse (1.23).
- **"Den körning som redovisas ska vara den sista"** och **"Varje körning en
  agent startar har en yttre tidsgräns".**
- **"ett skapande-nummer högre än uppgiftens eget är ett fel"** (posten om
  förkrav). Därför skapar 1.5b app-skalet och `/demo` före heron, och
  Playwright installeras i 1.8. Kraven i 1.12 gäller bara herons egna filer.
- **"Varje förutsättning som kräver att något installeras eller att användaren
  gör något skrivs som en F-fråga ... och planen anger vad som händer med
  paketordningen."** Docker är redan besvarat (A12). Paketordningen tills
  Docker finns står under "Arbetsgång".
- **"Repo-URL:en får bara stå i `docs/decisions.md` F4."** Lokala sökvägar med
  användarnamn skrivs aldrig i en fil som kan checkas in. Det följer av
  posten om användarnamn.
- **"En textspärr ... har ett avsnitt 'Det spärren inte fångar'."** Gäller
  spärren i 1.21.

## Arbetsgång

- Varje uppgift: implementera → tester → bygge, lint och test gröna → från
  1.8 täckning (K29) för nya och ändrade filer enligt `docs/ARKITEKTUR.md` 5.1
  och avsnitt 11 → bocka av här → en git-commit i formen
  `typ(område): beskrivning`.
- **Beslut (granskning per arbetspaket):** Fas 1 är indelad i arbetspaketen
  P0–P8 med flera commit-stora uppgifter i varje. `granskare` körs efter varje
  arbetspaket, inte efter varje commit. Skälet är att uppgifterna i ett paket
  hör ihop och bara kan bedömas tillsammans. Nästa paket startar först när
  granskarens skriftliga besked finns.
- **Beslut (Docker, A12):** Användaren installerar Docker Desktop själv. Finns
  Docker inte när 1.3 är klar granskas 1.3 ensam som P2. 1.4 blir då ett eget
  paket, P2b, som körs och granskas direkt när Docker är installerat. Under
  tiden får P3 och senare paket starta. 1.4 bockas inte av förrän
  `docker compose up` har körts.
- Efter varje fas stannar vi och sammanfattar. Användaren godkänner innan
  nästa fas planeras i detalj.

## Faser

- [ ] **Fas 1 – Grund + landningssida.** Monorepo, Docker Compose, CI, design
      tokens, komponentbibliotek och komplett landningssida med drönarvideo-hero.
      *Klar när (specen):* landningssidan är responsiv, och Lighthouse ger ≥ 90
      på Performance, Accessibility, Best Practices och SEO.
- [ ] **Fas 2 – Backend + databas.** Domänmodell, EF Core-migrationer,
      seed-data, regelmotor med tester och boknings-API.
      *Klar när (specen):* alla regeltester och samtidighetstestet går igenom.
- [ ] **Fas 3 – Inloggning.** Demo-inloggning, JWT och BankID-testmiljö.
      *Klar när:* specen anger inget (F3).
- [ ] **Fas 4 – Webbappen.** Bokningskalender per lokal, mina bokningar,
      avbokning och adminpanel (regler, godkännanden, bilduppladdning,
      utskick). *Klar när:* specen anger inget (F3).
- [ ] **Fas 5 – Mobilappen.** Inloggning, boka, mina bokningar, avbokning och
      push-notiser. Expo sätts upp här (A7). *Klar när:* specen anger inget (F3).
- [ ] **Fas 6 – Driftsättning.** Produktionsdatabas, objektlagring + CDN,
      domän (grannbo.se), HTTPS och felövervakning (Sentry).
      *Klar när:* specen anger inget (F3).

Faserna 2–6 bryts ner först när föregående fas är godkänd.

## Fas 1 – uppgifter

Uppgifterna körs i tabellens ordning. 1.5b har samma namn som i
`docs/ARKITEKTUR.md` men körs efter 1.11, eftersom den använder `Logo` (1.8) och
`EmptyState` (1.10).

| # | Klar | Uppgift | Agent | Klar när |
|---|------|---------|-------|----------|
| **P0** | | **Arkitektur för Fas 1** | | |
| 0.1 | [x] | `docs/ARKITEKTUR.md` för Fas 1, byggd på specen, A1–A13 och F1–F8. Kontrollen att .NET 10-SDK finns lokalt (A8, K1) kördes av koordinatorn 2026-11-20, och arkitekten klistrar in utdatan. | Arkitekt | Varje uppgift 1.1–1.24 och 1.5b har krav i avsnitt 11, och ingen uppgift använder något som en senare uppgift skapar. Utdatan från K1 står inklistrad i `docs/ARKITEKTUR.md`. |
| **P1** | | **Repo-grund** | | |
| 1.1 | [x] | Monorepo-skelett: `/api`, `/web`, `/mobile` (bara README, A7), `/docs` och en README-stomme i roten. | Byggare | Strukturen följer specens avsnitt 1, utom `docker-compose.yml`, som kommer i 1.4. Commit gjord. |
| 1.2 | [x] | `.gitignore` (.NET, Node, `.env`, user-secrets, certifikat, katalog för utredningsskript) och `.env.example`. | Byggare | Fejkade filer av varje ignorerad sort syns inte i `git status`. `.env.example` innehåller bara namn och platshållare. Commit gjord. |
| **P2** | | **Backend-skelett och Compose** (se beslutet om Docker) | | |
| 1.3 | [x] | Minimalt .NET 10-lösningsskelett med projekten Domain, Application, Infrastructure och Api enligt Clean Architecture, ett hälsoendpoint och ett xUnit-test för det. | Byggare | Bygge och test ger exit 0 (utdata inklistrad). Projektreferenserna går bara inåt. Commit gjord. |
| 1.4 | [ ] | `docker-compose.yml` med PostgreSQL och API. Kräver att användaren har installerat Docker Desktop (A12). | Byggare | `docker compose up` har körts. Båda tjänsterna startar, och hälsoendpointen svarar via Compose (utdata inklistrad). Inga hemligheter i filen, bara variabler från `.env`. Commit gjord. |
| **P3** | | **Webbgrund och CI** | | |
| 1.5 | [x] | Webben: Vite + React + TypeScript + Tailwind, lint, Vitest och Testing Library. Ingångspunkten `main.tsx` och `App` med ett första test. | Byggare | `build`, `lint` och `test` ger exit 0 (utdata inklistrad). Commit gjord. |
| 1.6 | [x] | GitHub Actions CI: bygg, lint och test för `/api` och `/web` på varje PR. | Byggare | Ett körningsresultat från GitHub är grönt (fjärrepot enligt F4). Commit gjord. |
| **P4** | | **Designgrund** | | |
| 1.7 | [x] | Design tokens i Tailwind-konfigen: färger (A1, A11), typsnitten Fraunces och Inter självhostade (A2), avstånd och radier, med `tokens.css`, `index.css` (bas-stil för `body`) och `main.tsx` ordagrant enligt `docs/ARKITEKTUR.md` 4.6. Testhjälparen `tests/support/contrast.ts` med feltabellen C1-C9 i 4.2 och egen testfil `tests/support/contrast.test.ts`, kontrasttestet `tests/tokens-contrast.test.ts` (4.2) och spärren mot externa typsnittsvärdar `tests/fonts-local.test.ts` (4.3). Dessutom typkontroll av `tests/`, `e2e/` och `playwright.config.ts` (nya `tsconfig.test.json`, ändrade `tsconfig.json` och `tsconfig.node.json`) och ESLint-regler med Node-globaler för `.js`/`.mjs`, med exakt det innehåll som står i `docs/ARKITEKTUR.md` 5.1 ("Typkontroll och lint av alla kataloger (1.7)"). `tsconfig.test.json` checkas in i samma commit som första filen i `tests/`. | Byggare | `tokens-contrast.test.ts` visar WCAG AA-kontrast för paren i `docs/ARKITEKTUR.md` 4.2 och X1 < 3. `contrast.test.ts` prövar varje rad C1-C9 med hela meddelandet. Typsnitten laddas lokalt, inte från en tredje part: `fonts-local.test.ts` är grön och föll (EXIT≠0) för varje mutation i 4.3, och paketens `font-family`, `license` och export av `./index.css` är redovisade (4.3). K27 ger EXIT≠0 med `TS2322` för varje fall (`src/`, `tests/`, `e2e/`, `vite.config.ts`, `playwright.config.ts`), K28 ger EXIT≠0 med `no-unused-vars` och utan `no-undef`, och därefter ger K8–K11 EXIT=0 i `web/` (utdata inklistrad). Commit gjord. |
| 1.8 | [ ] | Logotypen som SVG och favicon. Formen ritas efter mått som byggaren tar i den JPEG som är inbäddad i PDF:en (1560×1080). Färgerna kontrolleras mot PNG:n. Det finns ingen vektorkälla (A3, A13). Playwright installeras här, där det behövs första gången. Täckningspaketet `@vitest/coverage-v8` 5.1.1 och skriptet `test:coverage` läggs till här enligt `docs/ARKITEKTUR.md` 5.1 ("Täckning, K29", D54). | Byggare | SVG:n använder bara tokenfärger och har en tillgänglig titel. Måtten från JPEG:en och jämförelsen mot JPEG:en (form) och PNG:n (färg) är redovisade. K29 har körts för `tests/support/contrast.ts` och `src/components/brand/Logo.tsx` med EXIT=0, och varje otäckt rad är avgjord som onåbar (borttagen) eller oprövad (test skrivet), med utdata inklistrad. Commit gjord. |
| **P5** | | **Komponentbibliotek i `/web/src/components/ui` och app-skal** | | |
| 1.9 | [ ] | Button och Input. | Byggare | Tester täcker tillstånd, fokusmarkering, tangentbord och etiketter. Commit gjord. |
| 1.10 | [ ] | Card, Badge, Skeleton och EmptyState. | Byggare | Tester täcker varianterna i `docs/ARKITEKTUR.md`. Skeleton respekterar `prefers-reduced-motion`. Commit gjord. |
| 1.11 | [ ] | Toast och Accordion. | Byggare | Tester täcker tangentbordsnavigering och ARIA-attribut. Toast annonseras för skärmläsare. Commit gjord. |
| 1.5b | [ ] | App-skal: router, SiteHeader, LandingPage, /demo-platshållare. Routern har de sökvägar i `docs/ARKITEKTUR.md` 5.6 vars sidor finns i det här läget. `/integritet` läggs till i 1.19. | Byggare | Tester visar att `/` renderar LandingPage med SiteHeader och att `/demo` renderar platshållarsidan. Bygge, lint och test gröna. Commit gjord. |
| **P6** | | **Landningssida, del 1** | | |
| 1.12 | [ ] | Hero med drönarvideo i helskärm: platshållarna `hero-drone.webm`, `hero-drone.mp4` (WebM + MP4) och `hero-poster.jpg` (A4), gradient, rubrik, undertext och knapparna "Testa demon" (till `/demo` från 1.5b) och "Se hur det fungerar". Bara postern visas vid `prefers-reduced-motion` eller långsam anslutning. Inget i hero lazy-loadas. | Byggare | Mediaskriptet skapar hero-filerna, och de klarar gränserna i `docs/ARKITEKTUR.md` avsnitt 8. Kraven gäller bara hero-filerna: lokalbilderna kommer i 1.14 och `og-image.jpg` i 1.21. Tester täcker båda knapparna, båda videoformaten och fallet med bara poster. Commit `feat(web): hero med drönarvideo`. |
| 1.13 | [ ] | Sektionen Så fungerar det: tre steg med ikoner (Logga in med BankID → Välj lokal → Boka). | Byggare | Testad. Lazy-loadas. Commit gjord. |
| 1.14 | [ ] | Sektionen Lokalerna: kort för tvättstuga, bastu och festlokal med bild och de viktigaste reglerna. | Byggare | Korttexterna följer `docs/ARKITEKTUR.md` 7.3. Bilderna har alt-text och `srcset`. Commit gjord. |
| 1.15 | [ ] | Sektionen För styrelsen med skärmdumpar av adminpanelen som illustrativa platshållare (A5). | Byggare | Platshållarna är märkta som illustrationer. Testad. Commit gjord. |
| **P7** | | **Landningssida, del 2** | | |
| 1.16 | [ ] | Sektionen Mobilappen: mockup av appen och push-notiser (platshållare, A5). | Byggare | Notistexterna kommer från specens avsnitt 5. Testad. Commit gjord. |
| 1.17 | [ ] | Sektionen Prisplan: exempel för en fiktiv produkt (Bas / Förening / Fastighetsägare, innehåll enligt F6). | Byggare | Det framgår att det är ett exempel, och knapparna går till `/demo` och inte till någon betalning. Testad. Commit gjord. |
| 1.18 | [ ] | Sektionen Vanliga frågor (byggd med Accordion). | Byggare | Svaren motsäger inte specen. Testad. Commit gjord. |
| 1.19 | [ ] | Footer: länkar, integritetspolicy (sidan `/integritet` och dess route skapas här), kontakt (hej@grannbo.se) och raden "Grannbo är ett portfolioprojekt. Brf Solgläntan är en fiktiv förening." (A6). | Byggare | Raden står exakt så, och inget namn står i footern. Varje länk går till en sida som finns. Commit gjord. |
| 1.20 | [ ] | `docs/media-credits.md` med licens och källa för varje mediafil under `web/public/media` (`## Media`) och för varje typsnittspaket (`## Typsnitt`), med formatet i `docs/ARKITEKTUR.md` avsnitt 8, och `tests/media-credits.test.ts`. | Byggare | Varje mediafil under `web/public/media` har en rad under `## Media`, och varje rad har en fil. Varje `@fontsource-variable/*`-paket i `dependencies` i `web/package.json` har en rad under `## Typsnitt` med licensen `OFL-1.1`, och varje rad har ett paket. Båda kontrolleras av `media-credits.test.ts` (avsnitt 8). Commit gjord. |
| **P8** | | **Kvalitet och avslut** | | |
| 1.21 | [ ] | SEO och meta (titel, beskrivning, Open Graph med `og-image.jpg`, favicon, robots) och spärren mot påhittade omdömen, riktiga logotyper och riktiga betalningar. | Byggare | Testad. Spärren har ett avsnitt "Det spärren inte fångar". Commit gjord. |
| 1.22 | [ ] | Responsivitetskontroll vid 375, 768 och 1440 px för hela landningssidan. | Byggare | Ingen vågrät rullning vid någon bredd. Kontrollen är redovisad per bredd och sektion, och fynden är rättade. Commit gjord. |
| 1.23 | [ ] | Lighthouse på en produktionsbyggd landningssida. | Byggare | Performance, Accessibility, Best Practices och SEO ≥ 90 i sista körningen, med rapporten inklistrad. Commit gjord. |
| 1.24 | [ ] | README i roten för Fas 1: vad projektet är, hur man kör lokalt, hur man testar, och `.env.example`. | Dokumentator | Varje kommando i README har körts och gett exit 0. Commit gjord. |

### Fas 1 är klar när

- [ ] Uppgifterna 0.1–1.24 och 1.5b är avbockade, och varje arbetspaket har
      ett skriftligt godkännande från granskaren.
- [ ] Landningssidan är responsiv vid 375, 768 och 1440 px (1.22).
- [ ] Lighthouse ≥ 90 på Performance, Accessibility, Best Practices och SEO
      (1.23).
- [ ] Bygge, lint och test är gröna för `/api` och `/web`, lokalt och i CI.
      `docker compose up` har körts (1.4).
- [ ] Inga hemligheter eller certifikat finns i git, och `.env.example` finns.
- [ ] Inga påhittade kundomdömen, inga riktiga företags logotyper och inga
      riktiga betalningar.
- [ ] Användaren har godkänt fasen.

## Risker

- **Docker hinner inte installeras före 1.4.** Då gäller beslutet under
  "Arbetsgång": 1.4 blir ett eget paket, P2b, och Fas 1 kan inte bli klar
  förrän det är godkänt. När 1.3 blev klar fanns Docker inte (koordinatorn
  2026-11-20, `docs/ARKITEKTUR.md` avsnitt 12), och P3 startade före 1.4.
- **Kodarna i `ffmpeg-static` saknas (K18 i `docs/ARKITEKTUR.md`).** Då blockeras
  1.12. Vi märker det i kontrollen före 1.12, och det lämnas då tillbaka till
  arkitekten.
- **Platshållarvideon gör Lighthouse Performance < 90.** Spärren är 1.23, men
  storleksgränserna i avsnitt 8 mäts redan i 1.12.
- **Orange accent används som text på ljus bakgrund.** A11 förbjuder det
  (2.39:1). Vi märker det i kontrasttestet i 1.7 och i granskningen av varje
  sektion.
- **Byggaren fyller luckor i specen själv**, till exempel FAQ-texter. Vi märker
  det när granskaren jämför varje text med specen och `docs/ARKITEKTUR.md`.
