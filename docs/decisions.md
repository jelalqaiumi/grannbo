# Beslut, antaganden och öppna frågor

Specen `PROMPT-grannbo.md` är källan till sanning. Faserna (avsnitt 8) och
teknikstacken (avsnitt 1) står där och är inte öppna frågor. Här står bara
det som specen lämnar öppet.

"Svårt att ändra i efterhand" betyder att en ändring kräver omskrivning av
byggd kod, git-historik eller något som redan är publicerat.

## Antaganden och beslut

### A1 – Färger: nattblått som primärfärg, dämpad terrakotta/orange som accent
- **Datum:** 2026-11-20
- **Beslut:** Specen tillåter "djup skogsgrön eller nattblå" som primärfärg
  och "en dämpad accentfärg". Vi väljer nattblått som primärfärg och en dämpad
  terrakotta/orange som accent. Färgerna sätts som design tokens och prövas
  mot WCAG AA.
- **Skäl:** Logotypen använder nattblått och orange. Samma palett i logotyp
  och gränssnitt ger ett sammanhållet varumärke.
- **Svårt att ändra i efterhand:** Nej, så länge alla färger bara finns som
  tokens i Tailwind-konfigen.
- **Uppdaterat 2026-11-20 (användarens krav: sidan ska matcha logotypens
  färger):** Värdena nedan mättes ur logotypens PNG genom att räkna pixlar med
  System.Drawing. De ersätter de ungefärliga värdena som användaren först
  angav.

  | Roll | Värde i logotypen | Användning |
  |---|---|---|
  | Primär (nattblå) | `#1B2A41` | rubriker, primärknappar, mörka ytor |
  | Accent (orange) | `#E38B5C` | huset i logotypen, detaljer och ikoner |
  | Neutral ljus | `#C9D2DE` | ramar, inaktiva och låsta pass |
  | Bakgrund | `#F4F6F9` | sidans bakgrund |
  | Sekundär text | `#475569` | taglinen och brödtext |

  Logotypens bakgrund är kall och inte "varm off-white" som specen skriver.
  Användarens krav att följa logotypen går före, så bakgrunden blir `#F4F6F9`.
  Var orange får användas avgörs av A11.

### A2 – Typsnitt: Fraunces + Inter
- **Datum:** 2026-11-20
- **Beslut:** Fraunces för rubriker och Inter för brödtext, självhostade via
  `@fontsource-variable` (enligt F5). Inget hämtas från en tredje part vid
  sidvisning.
- **Skäl:** Specen föreslår Fraunces och Inter, med max två typsnitt. Båda
  har OFL-licens, som tillåter spridning i ett publikt repo. Självhostning
  ger bättre Lighthouse-resultat och läcker inga besöksdata.
- **Svårt att ändra i efterhand:** Nej, om typsnitten bara finns som tokens.

### A3 – Logotypen ritas om som SVG
- **Datum:** 2026-11-20
- **Beslut:** Logotypen (kalender som rutnät med 3×4 rutor, där en ruta är ett
  orange hus, plus ordmärket "Grannbo") ritas om som SVG med tokenfärger.
  Byggaren mäter geometrin i den JPEG som är inbäddad i PDF:en och ritar
  SVG:n efter måtten. Färgerna kontrolleras mot PNG:n (A13).
- **Skäl:** En rasterbild blir suddig på skärmar med hög upplösning och kan
  inte färgstyras. Det finns ingen vektorkälla, så SVG:n måste ritas för hand
  efter uppmätta mått.
- **Svårt att ändra i efterhand:** Nej.

### A4 – Platshållarvideo och platshållarposter
- **Datum:** 2026-11-20
- **Beslut:** Hero använder platshållarna `/web/public/media/hero-drone.webm`,
  `hero-drone.mp4` (specen kräver WebM + MP4) och `hero-poster.jpg` tills
  riktig film finns. Specen anger själv namnen på mp4-filen och postern.
  Platshållarna ska ha fri licens eller vara egna och stå i
  `docs/media-credits.md`.
- **Skäl:** Det finns ingen drönarfilm ännu.
- **Svårt att ändra i efterhand:** Nej. Filerna byts utan kodändring.

### A5 – Skärmdumpar och app-mockup är illustrativa platshållare i Fas 1
- **Datum:** 2026-11-20
- **Beslut:** "Skärmdumpar av adminpanelen" (För styrelsen) och "mockup av
  appen" (Mobilappen) är illustrativa platshållare i Fas 1. De byts mot
  riktiga skärmdumpar när adminpanelen (Fas 4) och appen (Fas 5) finns.
- **Skäl:** Adminpanelen byggs först i Fas 4 och appen först i Fas 5.
- **Svårt att ändra i efterhand:** Nej.

### A6 – Footerns rad om portfolioprojektet
- **Datum:** 2026-11-20
- **Beslut:** Raden i footern lyder exakt "Grannbo är ett portfolioprojekt.
  Brf Solgläntan är en fiktiv förening." Inget namn står i footern (F1).
- **Skäl:** Användaren vill inte ha något namn i projektet. Upplysningen om att
  föreningen är fiktiv står kvar, så att ingen tror att det är en riktig
  produkt eller förening.
- **Svårt att ändra i efterhand:** Nej.

### A7 – Mobile-mappen i Fas 1
- **Datum:** 2026-11-20
- **Beslut:** `/mobile` skapas i Fas 1 med bara en README. Expo sätts upp i
  Fas 5.
- **Skäl:** Specen kräver mappen i monorepot, men appen hör till Fas 5. Ett
  tidigt Expo-projekt skulle åldras och belasta CI utan nytta.
- **Svårt att ändra i efterhand:** Nej.

### A8 – Verktygsversioner verifieras lokalt
- **Datum:** 2026-11-20
- **Beslut:** Innan något byggs kontrolleras att .NET 10-SDK finns lokalt,
  och utdata redovisas. Inget byggs i det steget. Versioner för Node, Docker
  och Expo (inför Fas 5) verifieras på samma sätt innan de skrivs in.
- **Skäl:** Regeln i `LARDOMAR.md`: "Ett kommando får skrivas in ... först när
  det har körts i den här miljön med exit 0."
- **Svårt att ändra i efterhand:** Nej.

### A9 – Granskning per arbetspaket
- **Datum:** 2026-11-20
- **Beslut:** Fas 1 delas in i arbetspaket (P0–P8, och P2b om A12 kräver det)
  med flera commits i varje. `granskare` körs efter varje arbetspaket, och
  nästa paket startar först när granskarens skriftliga besked finns.
- **Skäl:** Regeln i `LARDOMAR.md`: "Nästa paket startar först när
  granskarens skriftliga besked ... om föregående paket finns." Uppgifterna i
  ett paket kan bara bedömas tillsammans.
- **Svårt att ändra i efterhand:** Nej.

### A10 – Prisplanen är ett exempel
- **Datum:** 2026-11-20
- **Beslut:** Prisplanen (Bas / Förening / Fastighetsägare) visas som ett
  exempel för en fiktiv produkt. Inga knappar leder till riktig betalning.
- **Skäl:** Specen säger "exempel för fiktiv produkt" och "inga riktiga
  betalningar".
- **Svårt att ändra i efterhand:** Nej.

### A11 – Orange är aldrig textfärg på ljus bakgrund
- **Datum:** 2026-11-20
- **Beslut:** Kontrasten räknades ut med WCAG-formeln i Node: `#E38B5C` mot
  `#F4F6F9` gav 2.39:1, vilket är under 3:1 även för stor text. Orange används
  därför bara till ytor och dekor på ljus bakgrund. På nattblått (`#1B2A41`)
  gav samma orange 5.58:1, så där är den tillåten som text. Text i
  accentfärg på ljus bakgrund använder `accent-700 #9A4A28` (5.73:1).
- **Skäl:** Specen kräver WCAG AA-kontrast.
- **Svårt att ändra i efterhand:** Nej.

### A12 – Användaren installerar Docker Desktop själv
- **Datum:** 2026-11-20
- **Beslut:** Användaren installerar Docker Desktop själv. Användaren sa
  2026-11-20: "ok, jag installerar Docker". Uppgift 1.4 bockas inte av förrän
  `docker compose up` har körts. Finns Docker inte när 1.3 är klar blir 1.4
  ett eget paket (P2b), enligt beslutet i `docs/plan.md` under "Arbetsgång".
- **Skäl:** Specen kräver Docker Compose för lokal utveckling. Docker saknades
  när detta skrevs. Det är ingen öppen fråga, eftersom användaren redan har
  svarat.
- **Svårt att ändra i efterhand:** Nej.

### A13 – Logotypkälla: inbäddad JPEG för formen, PNG för färgerna
- **Datum:** 2026-11-20
- **Beslut (koordinatorns beslut):** `K4 · Rutnätet.pdf` på användarens
  skrivbord innehåller inga banor, bara en inbäddad JPEG i 1560×1080. Den
  har tre gånger PNG:ns upplösning och är facit för formen. Byggaren mäter
  geometrin i den och ritar SVG:n i uppgift 1.8 efter måtten.
  `K4 · Rutnätet@1x.png` är facit för färgerna (A1). Det finns ingen
  vektorkälla.
- **Skäl:** JPEG:en har högst upplösning och ger därför säkrast mått. Den är
  komprimerad med förluster, så dess färger är mindre pålitliga än PNG:ns.
  Färgvärdena i A1 mättes ur PNG:n.
- **Svårt att ändra i efterhand:** Nej.

## Frågor

### F1 – Namnet i footern
- **Datum:** 2026-11-20
- **Fråga:** Vilket namn ska stå i stället för "[mitt namn]" i specens rad för
  footern?
- **Skäl:** Specen har en platshållare, och namnet får inte hittas på.
- **Svårt att ändra i efterhand:** Delvis, eftersom ett namn ligger kvar i en
  publicerad git-historik.
- **Besvarad 2026-11-20:** Inget namn i footern. Raden blir "Grannbo är ett
  portfolioprojekt. Brf Solgläntan är en fiktiv förening." (A6).

### F2 – Vilken logotypfil gäller
- **Datum:** 2026-11-20
- **Fråga:** Är det `K4 · Rutnätet@1x.png` eller `Grannbo logo.png` (båda på
  användarens skrivbord) som gäller? Finns logotypen i större upplösning
  eller som vektorfil?
- **Skäl:** Behövs i uppgift 1.8. Färgvärdena för A1 läses också ur filen.
- **Besvarad 2026-11-20:** Användaren valde K4-logotypen. Det finns ingen
  vektorfil. `K4 · Rutnätet.pdf` innehåller bara en inbäddad JPEG i
  1560×1080, alltså tre gånger PNG:ns upplösning, och den är facit för
  formen. PNG:n är facit för färgerna (A13). PNG:n kopieras till repot som
  referens i uppgift 1.8.
- **Svårt att ändra i efterhand:** Nej.

### F3 – "Klar när" för faserna 3–6
- **Datum:** 2026-11-20
- **Fråga:** Specen anger "Klar när" bara för Fas 1 och Fas 2. Vilka
  kriterier gäller för Fas 3–6?
- **Skäl:** Användaren vill stanna och godkänna efter varje fas, och det
  kräver mätbara kriterier. Behöver besvaras senast när respektive fas
  planeras. Blockerar ingenting i Fas 1.
- **Svårt att ändra i efterhand:** Nej.

### F4 – Fjärrepo för CI och vad som checkas in
- **Datum:** 2026-11-20
- **Fråga:** Finns det ett GitHub-repo som projektet ska pushas till, så att
  CI (uppgift 1.6) kan köras på riktigt? Ska `LARDOMAR.md` och agentfilerna
  finnas i det publika repot?
- **Skäl:** Specen kräver GitHub Actions på varje PR, och det går inte att
  verifiera utan ett fjärrepo. Det som en gång har publicerats för
  rekryterare går inte att ta tillbaka.
- **Svårt att ändra i efterhand:** Ja, för det som redan är publicerat.
- **Besvarad 2026-11-20:** Repot är `https://github.com/jelalqaiumi/grannbo.git`
  (remote `origin`). `LARDOMAR.md` har ersatts av en destillerad version med
  bara generella arbetssätt, och den checkas in. Originalet heter
  `LARDOMAR.arkiv.md`, ligger kvar lokalt och står i `.gitignore`.

### F5 – Licensen för General Sans
- **Datum:** 2026-11-20
- **Fråga:** Tillåter ITF Free Font License att typsnittsfilerna ligger i ett
  publikt repo?
- **Besvarad 2026-11-20 (koordinatorns beslut):** General Sans väljs bort.
  **Fraunces** (OFL) används för rubriker och **Inter** (OFL) för brödtext,
  båda via `@fontsource-variable` (A2). Båda licenserna tillåter uttryckligen
  spridning, så licensfrågan behöver aldrig avgöras.
- **Svårt att ändra i efterhand:** Nej, eftersom typsnitten bara ligger i
  tokens.

### F6 – Prisplanens innehåll
- **Datum:** 2026-11-20
- **Besvarad 2026-11-20 (koordinatorns beslut):** Arkitektens förslag gäller:
  - Bas: 490 kr/mån, upp till 30 lägenheter, alla lokaler.
  - Förening: 990 kr/mån, upp till 150 lägenheter, BankID och mobilapp med
    notiser.
  - Fastighetsägare: "Pris på förfrågan", flera föreningar och gemensam
    administration.

  Sektionen märks tydligt som ett exempel för en fiktiv produkt, och inga
  knappar leder till betalning (A10).
- **Svårt att ändra i efterhand:** Nej.

### F7 – Riktig drönarfilm och riktiga foton
- **Datum:** 2026-11-20
- **Besvarad 2026-11-20 (koordinatorns beslut):** Fas 1 använder
  egenproducerade platshållare. ffmpeg fanns inte installerat
  (`ffmpeg: command not found`), så platshållarvideon genereras med
  devberoendet `ffmpeg-static`. Beslutet att inte installera någon programvara
  i systemet gäller bara ffmpeg. Docker installeras av användaren (A12).
  Licensierade foton och riktig film kan bytas in senare utan kodändringar.
- **Svårt att ändra i efterhand:** Nej.

### F8 – Ska specen och agentfilerna checkas in
- **Datum:** 2026-11-20
- **Besvarad 2026-11-20 (koordinatorns beslut):** Nej, tills vidare.
  `PROMPT-grannbo.md`, `.claude/` och `LARDOMAR.arkiv.md` står i
  `.gitignore`. Det är lätt att lägga till dem senare, men det går inte att
  ta bort dem ur en publicerad historik.
- **Svårt att ändra i efterhand:** Ja, åt ena hållet. Därför är "ut"
  standardvalet.
