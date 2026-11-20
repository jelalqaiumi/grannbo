# Lärdomar

Teamets minne. Varje fel som gjorts i det här projektet står här, tillsammans
med en regel som ska hindra att det görs om.

**Regler för filen**

- Bara fel som faktiskt inträffat. Inget tyckande, inga gissningar.
- Radera aldrig en post. Slå ihop dubbletter om det blir rörigt.
- "Regel framåt" måste gå att följa bokstavligt av någon som inte var med.
- Har samma fel dykt upp 3 gånger — gör om det till ett automatiskt test
  och skriv `LÖST MED TEST` i posten.

**Mall**

```
### YYYY-MM-DD — <område>: <kort titel>
**Vad gick fel:** <konkret, en mening>
**Varför:** <grundorsaken, inte symtomet>
**Regel framåt:** <handlingsbar instruktion>
```

---

## Generella regler (destillerade ur tidigare projekt)

Bindande från start: mönster som gått fel flera gånger tidigare, översatta till Grannbos stack.

### Process och överlämning

- Nästa paket startar först när granskarens skriftliga besked (godkänt eller
  tillbaka) om föregående paket finns. (Parallellt bygge gjorde granskningar ogiltiga.)
- Byggaren fattar inga egna beslut. Ett fall som specen inte avgör (statuskod,
  svarsfält, gränsvärde) lämnas tillbaka till arkitekten innan något test skrivs för det.
- Skiljer sig `docs/ARKITEKTUR.md` från det koden faktiskt gör lämnas paketet tillbaka
  till arkitekten. En notering i en testkommentar räknas inte som åtgärd.
- Ändras vad ett paket ska leverera skrivs hela paketets rad i `docs/plan.md` om, både
  "Uppgift" och "Klar när", i samma ändring. Byter användaren ett begrepp: sök det
  gamla ordet i `docs/plan.md` och `docs/ARKITEKTUR.md` och skriv om varje träff.
- Rätta efter regeln, inte efter fyndets radnummer: sök på den felaktiga meningens
  egna ord i hela trädet (kod, tester, docs, README) före och efter rättningen.
  (Halva rättningar var den vanligaste orsaken till nya granskningsrundor.)
- Ändra bara det uppdraget gäller. Oombedda omformuleringar görs inte; krävs en
  ändå redovisas den som egen rad. (En "språkputs" gjorde en korrekt mening fel.)
- En lärdom som föreskriver en konkret konstruktion byggs eller avfärdas med skäl
  i beslutsloggen. Obesvarad räknas den som ej åtgärdad.
- Dör en agent utan slutrapport gör nästa agent om kontrollerna från de ändrade
  filerna i stället för att anta att de är gjorda.
- Utredningsskript, mutationer och instrumentering görs i en kopia eller i en
  katalog som står i `.gitignore`, aldrig i källträdet.

### Verifiering och körning av kommandon

- Ett kommando får skrivas in i `docs/ARKITEKTUR.md`, README, CI eller `package.json`
  först när det har körts i den här miljön med exit 0. Klistra in utdatan.
- Den körning som redovisas ska vara den sista, med antal fallerade test och
  exitkod inklistrade ordagrant. (Ett paket lämnades vidare med "fail 1".)
- Exit ≠ 0 av vilket skäl som helst, även ett som ser ut att komma från OS eller
  Docker, betyder ej klart, tills orsaken är hittad eller tre gröna körningar i rad visats.
- Varje körning en agent startar har en yttre tidsgräns, t.ex. `timeout 900 dotnet test`
  och `timeout 300 npx vitest run`. Exit 124 eller vänteläge mitt i körningen gör
  den ogiltig; kör om. (En testkörning stod i åtta timmar.)
- Ett påstående om exakthet eller en gräns ("exakt", "högst", "marginalen är noll")
  skrivs först när gränsvärdet och värdena precis på båda sidor körts och de
  oavrundade utfallen klistrats in.
- Ett påstående av formen "ingen X gör Y" står tillsammans med den sökning som
  skulle ha hittat ett motexempel, körd.
- Ord som "uppmätt", "bindande" eller "fångas av X" i en kommentar kräver en körd
  mutation som visar det: `mutation: <gammalt> -> <nytt> ger EXIT=<kod>`.

### Tester

**Mutation och täckning**
- Varje villkor paketet lägger till eller ändrar prövas med mutation: ta bort eller
  ändra det i en kopia, kör testerna och kräv fail. Listan genereras ur diffen, inte
  ur dokumentet. Överlever villkoret: skriv ett test som bara det kan klara, eller ta bort det.
- Ett villkor med n led i `||`/`&&` har n mutationer och n testfall där bara det
  ledet avgör. (Det andra ledet glömdes gång på gång.) En mutation som bara fälls
  ibland är inget skydd; kör den minst 10 gånger.
- En gren som ingen indata når tas bort. Kör täckning (`coverlet`/`vitest --coverage`)
  på nya filer och avgör per otäckt rad: onåbar (ta bort) eller oprövad (skriv test).
- Varje ny modul/klass får en egen testfil i samma paket. Indirekt täckning via en
  annan moduls tester räcker inte.

**Gränsfall och testdata**
- Varje gräns testas på båda sidor och precis på gränsen. Ett villkor som pekar ut
  ett värde (`== null`, `GET`) testas med grannvärdet (`undefined`, `HEAD`, `PATCH`).
- Testdata väljs så att fälten skiljer sig åt (t.ex. startdatum ≠ slutdatum,
  namn ≠ id). Är två fält lika i all testdata prövar assertionen inte vilket som läses.
- Ett test av att något töms eller ersätts startar i motsatt läge. En funktion som
  skriver om ett tillstånd anropas två gånger: längre lista följd av kortare, tom följd av icke-tom.
- Ett undantagstest asserterar hela meddelandet, inte bara typen. (Typen delas av
  alla spärrar i modulen.)
- Jämför svaret mot en literal i testfilen, aldrig mot en konstant importerad från
  koden under test. Två konstanter som beskriver samma domän får ett test som kräver att de stämmer.
- Varje format appen visar och läser får ett rundgångstest: formatera, läs in igen,
  kräv samma värde eller ett vägledande felmeddelande.

**Tid, språk och determinism**
- Tidsberoende logik testas med en injicerad klocka (`TimeProvider` i .NET,
  `vi.setSystemTime` i Vitest). Inget test läser den riktiga klockan eller asserterar på körtid.
- Kultur och tidszon sätts explicit (`sv-SE`, `Europe/Stockholm`) i kod och test,
  och testet ska falla om de tas bort även på en svensk maskin.
- Ett test som kan bli rött på oförändrad kod är ett fel. Har ett osäkert utfall
  en omförsöksväg ska den ha ett tak som asserteras; övriga osäkra utfall är hårda fel.

**Tidsgränser och hängande tester**
- Varje väntan på något externt (container, process, port, meddelande) kapplöper
  mot en tidsgräns och mot att motparten dör. Felmeddelandet tar med motpartens
  exitkod och stderr. Tidsgränser är namngivna konstanter, inte literaler.
- Ett test som startar en process eller container körs en gång medvetet trasigt
  (fel sökväg, Docker stoppad) och ska då falla inom sekunder, inte hänga.
- Testhjälpare som ändrar globalt tillstånd (miljövariabler, klocka, kultur) ska tåla
  två anrop i samma test och återställa korrekt; det prövas med ett eget test.

**Spärrar som läser källkod som text**
- Föredra beteendetest. En textspärr prövas med varje stavning språket tillåter
  (skiftläge, blanktecken, alias, citattecken, uttryck i stället för literal) och har
  ett avsnitt "Det spärren inte fångar". Kommentarborttagning hoppar över strängar.
- En spärr som ska gälla "varje fil" väljer filer rekursivt, aldrig ur en fast lista,
  och följer inte symboliska länkar.

### Dokumentation som stämmer med koden

- `docs/ARKITEKTUR.md` har exakt ett facit per fråga. Skrivs ett påstående om en funktion:
  sök funktionsnamnet i hela filen och få varje träff att ge samma svar.
- Beslutsloggen innehåller beslut, inte påståenden om hur koden ser ut i dag.
  Mätvärden skrivs i dåtid med datum eller paket. (Presens åldrades utan att någon rörde raden.)
- Innan ett paket lämnas vidare söks åldrade markörer upp ("kvar i paket", "inte
  körd", "i dag", "ska ersättas", "byggaren ska", "förrän") och varje träff skrivs
  om i dåtid med utfallet eller stryks.
- Skriv inga antal i löptext eller kommentarer när uppräkningen står intill ("dessa
  fält:", inte "fem fält:"). Måste ett antal stå: skriv kommandot som räknar det och kör det efteråt.
- Peka inte med radnummer in i filer som ändras. Använd ett sökbart ankare som ger
  exakt en träff; samma krav gäller kodcitat och mutationer i specen.
- Byter ett namn, en text eller ett värde: sök det gamla i `docs/ARKITEKTUR.md`, `docs/plan.md`,
  README, källkod och tester, och rätta varje träff i samma ändring.
- En tabell över svar för en endpoint räknar upp alla statuskoder koden kan ge.
- Varje modul som kastar eller returnerar fel har en tabell i `docs/ARKITEKTUR.md` med
  villkor och svensk text per rad, skriven innan koden.
- README och användarguide lovar bara det som finns. Läs varje mening mot koden,
  inte bara meningar som nämner ett funktionsnamn.
- Osynliga tecken (U+00A0, U+2212, U+FEFF, U+200B) skrivs alltid som escape
  (`\u00A0`) i kod, tester och docs. Sök efter icke-ASCII i strängliteraler före
  överlämning. (Felet återkom sju gånger, även i meningen som förbjöd det.)

### Validering och indata

- Normalisera först värdet till en typ, kör sedan alla regler i en enda ordnad
  kedja. Intervall kontrolleras på det tolkade värdet, aldrig enbart med regex.
- Validera på servern även när klienten validerar. Okända fält avvisas
  (strikt deserialisering), och värden från injicerade beroenden valideras som indata.
- Kontrollera gränser igen på den form som lagras (efter avrundning). Belopp
  hanteras som `decimal` eller heltal i öre, aldrig som flyttal.
- Textlängd mäts i tecken som användaren ser, inte UTF-16-enheter, och testas med
  emoji. Avvisa orimligt lång indata billigt innan dyr räkning.
- Ett uppslag med en ovaliderad nyckel (enum, dictionary) har en explicit spärr
  (`Enum.IsDefined`, `TryGetValue`). Ingen publik funktion returnerar NaN, -0 eller ∞.
- Alla publika funktioner i en modul har samma ingångskontroll och samma feltyp.
- Innan ett typvillkor skrivs: sök efter en befintlig hjälpare som avgör samma sak
  och återanvänd den. (En svagare kopia släppte igenom fel indata.)

### Samtidighet och lagring

- Läs-ändra-skriv görs i ett steg: transaktion eller optimistisk samtidighet
  (concurrency token) i EF Core. Dubbelbokning stoppas av en unik constraint i
  databasen, inte bara av en kontroll i koden.
- Varje samtidighetsskydd testas med parallella anrop (minst 20 omgångar): två
  lyckade svar ska ge två rader, annars ska minst ett anrop ge fel. Beskriv
  samtidighet som vad användaren förlorar, inte vad databasen blir.
  (Två snabba klick tappade data medan båda fick "lyckades".)
- Ett lås i processen skyddar inte mot flera instanser. Skriv i `docs/ARKITEKTUR.md`
  vilken nivå skyddet gäller, och lägg det i databasen om flera instanser kan köras.
- Validera hela indatan innan något skrivs. En misslyckad skrivning lämnar
  befintlig data oförändrad, och det testas.
- Temporära resurser får unika namn per anrop och städas i `finally`/`using`.

### Git

- Kör aldrig `git checkout --`, `git restore` eller `git reset --hard` mot
  okommitterat arbete. Kopiera först. Misstänks radslut: jämför `git diff` med `git diff -w`.
- Före och efter en granskning tas kontrollsummor av alla filer, även ospårade
  (`git status --porcelain -uall`). Ändrades något under granskningen görs den om.
  Samma kontroll, inte en tom `git diff`, visar att ett paket "inte ändrar källkoden".
- Läs `git diff` rad för rad före överlämning. Felsökningsutskrifter, `TODO` och
  `FIXME` i källkoden stoppar paketet.

### Felmeddelanden till användaren

- Inget undantag når användaren rått: en global felhanterare svarar 500 med en
  svensk text ur en namngiven konstant, och en otolkbar förfrågan ger 400. Inga stackspår.
- Fel vid uppstart (port upptagen, databas nås inte) ger ett kort svenskt besked
  som säger vad användaren ska göra, och testas.
- Fel från disk, databas och nätverk fångas och kastas om med svensk text och det
  ursprungliga felet som inre undantag.
- Ett felmeddelande får aldrig råda användaren till något skadligt (som att starta en instans till).
- En användarsträng skrivs tecken för tecken likadant i kod och test, så att en
  sökning hittar alla ställen den prövas.

### Kodhygien

- När en ny funktion tar över en gammal tas den gamla bort i samma paket, eller
  märks med skälet. Sök efter anropare för varje publik medlem före överlämning.
- Skriv ingen tredje kopia av ett mönster eller en hjälpare; gör en gemensam.
- Sökvägar byggs från programmets egen plats (`AppContext.BaseDirectory`,
  `import.meta.url`), aldrig från arbetskatalogen.
- Tas en export eller konstant bort: sök efter det den refererade till och ta
  bort det som blivit oanvänt.

---

## Poster

<!-- Nya lärdomar från Grannbo läggs till här nedanför, nyast sist. -->

### 2026-11-20 — dokumentation (P0): ersatta beslut ligger kvar i decisions.md, plan.md och ARKITEKTUR.md (återfall av generell regel)
**Vad gick fel:** När F5 (Fraunces i stället för General Sans), F1 (inget namn i footern) och A11 (orange aldrig text) besvarades stod de gamla beskeden kvar: A2 säger fortfarande "General Sans", A6, plan 1.19 och planens risklista väntar fortfarande på ett namn, A1 säger "cirka 2,6:1" och att stor text är tillåten, skuggorna i ARKITEKTUR 4.4 använder den gamla primärfärgen `rgb(30 42 68)` (#1E2A44), och källhänvisningarna säger "A1-A10, F1-F4" respektive "A1–A8".
**Varför:** Det nya beslutet skrevs som en ny post, men ingen sökte efter det gamla ordet och värdet i alla tre dokumenten.
**Regel framåt:** När ett beslut i `docs/decisions.md` ersätter ett annat: skriv om den gamla postens "Beslut"-rad till "Ersatt av <id>", och sök sedan det gamla värdet (namn, hex, siffra, typsnitt) i hela `docs/` och rätta varje träff i samma ändring; klistra in sökningen med noll träffar i redovisningen.

### 2026-11-20 — dokumentation (P0): användarnamn i dokument som ska checkas in
**Vad gick fel:** `docs/ARKITEKTUR.md` innehåller Windows-användarnamnet i en lokal sökväg (avsnitt 1, logotypens källa) och repo-URL:en med GitHub-användarnamnet (avsnitt 12), och `docs/decisions.md` F2 innehåller samma lokala sökväg, trots kravet att inget namn får finnas någonstans.
**Varför:** Lokala sökvägar och URL:er klistrades in som belägg utan att de lästes som personuppgifter.
**Regel framåt:** Skriv aldrig `C:\Users\<namn>\...` i en fil som kan checkas in; skriv `%USERPROFILE%\OneDrive\Desktop\...`. Repo-URL:en får bara stå i `docs/decisions.md` F4. Före överlämning: kör `grep -rniE "<användarnamn>|<efternamn>|C:.Users" docs/ README.md web/ api/` och klistra in sökningen; enda tillåtna träff är F4.

### 2026-11-20 — plan (P0): förkrav som skapas först i en senare uppgift
**Vad gick fel:** 1.12 kräver att `make-placeholders.mjs` ger exit 0 och att `media-files.test.ts` är grönt för *alla* filer i mediatabellen, men lokalbilderna skapas i 1.14 och `og-image.jpg` i 1.21; Playwright beskrivs som "bara för 1.22" men behövs redan i 1.8 (logojämförelse) och i medieskriptet; och router, `SiteHeader`, `LandingPage` och `/demo` (som herons knapp i 1.12 länkar till) är inte tilldelade någon uppgift i avsnitt 11, och sidan `/demo` hamnar i 1.19.
**Varför:** Kraven skrevs per avsnitt och mappades sedan till uppgifter, utan att någon gick igenom uppgifterna i ordning och frågade "finns allt detta redan när uppgiften körs?".
**Regel framåt:** Efter att avsnitt "Krav per uppgift" skrivits: gå igenom uppgifterna i nummerordning och lista för varje uppgift varje fil, paket och route den använder samt vilken uppgift som skapar den; ett skapande-nummer högre än uppgiftens eget är ett fel. Varje fil i mappstrukturen ska ha exakt en skapande uppgift.

### 2026-11-20 — arkitektur (P0): krav som inte kan uppfyllas som de står
**Vad gick fel:** Avsnitt 9.1 kräver att `/integritet` och `/demo` rullas tills "alla sex `SectionId`" är monterade, vilket de sidorna aldrig har; avsnitt 1 kräver `@vitest-environment node` för alla tester i `web/tests/`, men `logo-colors.test.ts` (4.5) ska rendera `Logo` med `getByRole` och är en `.ts`-fil; och footern ska ligga i en "`LazySection`-liknande omslutning" som saknar gränssnitt, fast `LazySection` kräver ett `SectionId`.
**Varför:** Testkraven skrevs för huvudfallet (landningssidan, filtester) och prövades inte mot varje sida och fil de räknar upp.
**Regel framåt:** För varje testkrav som gäller flera sidor eller filer: skriv kravet per sida/fil, eller kontrollera att varje förutsättning i kravet finns på varje sida/fil i listan. Varje komponent som byggaren ska skriva har ett TS-gränssnitt i ARKITEKTUR.md; "X-liknande" är inget gränssnitt.

### 2026-11-20 — arkitektur (P0): oangiven ignorering ger rött `format:check` lokalt
**Vad gick fel:** K9 (`prettier --check .`) och K8 (`eslint .`) körs från `web/`, men innehållet i `web/.prettierignore` och ESLints ignoreringar är inte angivna, och rotens `.gitignore` läses inte av Prettier när arbetskatalogen är `web/`; efter K10/K12/K13 kontrolleras därför `dist/`, `.lighthouse/` och `playwright-report/`.
**Varför:** Ignoreringsfilerna listades i mappstrukturen men fick inget innehåll, och CI:s ordning (format före build) döljer felet.
**Regel framåt:** Varje konfigurationsfil i mappstrukturen har sitt innehåll angivet i ARKITEKTUR.md. Varje genererad katalog under `web/` (bygge, rapporter, testutdata) står i `.gitignore`, `.prettierignore` och ESLints `globalIgnores`, och K8 och K9 körs en gång efter K10–K13 lokalt.

### 2026-11-20 — dokumentation (P0): fel faktauppgifter och antal i ARKITEKTUR.md (återfall av generell regel)
**Vad gick fel:** Logotypens källa anges som 520×332 px men är 520×360 px (läst ur PNG-huvudet), och avsnitt 2 säger "Fem enkla ikoner" medan avsnitt 3.1 och 1 räknar upp sju (tre stegikoner, chevron, stäng, paus, spela).
**Varför:** Värdena skrevs in utan att mätas eller räknas, i strid med regeln om antal i löptext.
**Regel framåt:** Ett mått eller antal i ARKITEKTUR.md skrivs bara tillsammans med kommandot som mätte det och dess utdata; antal skrivs inte alls när uppräkningen står i samma fil.

### 2026-11-20 — plan (P0): planen och ARKITEKTUR.md säger olika och hänvisar till poster som inte finns
**Vad gick fel:** Plan 1.14 kräver att reglerna på korten är "ordagrant" specens tabell medan ARKITEKTUR 7.3 föreskriver en avvikelse; plan 1.12 nämner bara `hero-drone.mp4` fast specen kräver WebM + MP4; plan.md "Lärdomar som gäller här" och ARKITEKTUR:s beslutslogg (D2, D3, D8, D10, D20) hänvisar till daterade poster och regler som bara finns i `LARDOMAR.arkiv.md`, inte i `LARDOMAR.md`.
**Varför:** Planen skrevs före arkitekturen och mot den gamla lärdomsfilen, och skrevs inte om när arkitekturen och den destillerade `LARDOMAR.md` kom.
**Regel framåt:** När ARKITEKTUR.md ändrar vad en uppgift levererar skrivs uppgiftens hela rad i `docs/plan.md` om i samma ändring. En hänvisning till en lärdom citerar en rad som finns i `LARDOMAR.md` (sök den och få en träff); hänvisningar till `LARDOMAR.arkiv.md` är förbjudna.

### 2026-11-20 — plan (P0): blockering som strider mot ett beslut och inte är ställd som fråga
**Vad gick fel:** ARKITEKTUR 13 säger att Docker "måste installeras innan 1.4" och att det inte är en fråga till användaren, medan F7 säger att ingen programvara installeras i systemet; ingen uppgift eller fråga äger installationen, så P2 kan inte bli godkänt och alla senare paket blockeras.
**Varför:** En förutsättning som kräver användarens handling bokfördes som teknisk risk i stället för som en öppen fråga.
**Regel framåt:** Varje förutsättning som kräver att något installeras eller att användaren gör något skrivs som en F-fråga i `docs/decisions.md` med vilka uppgifter den blockerar, och planen anger vad som händer med paketordningen tills den är besvarad.

### 2026-11-20 — dokumentation (P0, omgranskning): en fil kallas vektorfil utan att någon öppnat den
**Vad gick fel:** A3, A13, F2, ARKITEKTUR 4.5 och D21 säger att `K4 · Rutnätet.pdf` är en vektorfil som är "facit för form" och ger "exakt geometri", men PDF:en innehåller en enda JPEG-bild (`/Subtype /Image`, `/Filter /DCTDecode`, 1560×1080) som täcker hela sidan, osynlig text (`3 Tr`) och inga ritade banor; granskarens förra rapport kallade den också "sannolikt en vektorfil".
**Varför:** Filens format slöts ur filändelsen och filnamnet, och ingen öppnade filen innan beslutet skrevs.
**Regel framåt:** Innan ett dokument säger vilket format en källfil har (vektor, upplösning, färgrymd) öppnas filen med ett kommando och utdatan klistras in; för PDF körs `grep -a -c "/Subtype */Image"` och sidans innehållsström läses, och finns en bild-XObject som täcker sidan är PDF:en en rasterbild.

### 2026-11-20 — plan (P0, omgranskning): plan.md och ARKITEKTUR.md ger olika "Klar när" för 1.6 (återfall av posten om att planen och ARKITEKTUR.md säger olika)
**Vad gick fel:** Plan 1.6 kräver att en körning på GitHub är grön, medan ARKITEKTUR avsnitt 11, rad 1.6, fortfarande tillåter att uppgiften märks "ej kört på GitHub" om pushen inte görs.
**Varför:** Projektledaren skrev om planens rad men arkitekten skrev inte om sin rad i avsnitt 11, och ingen jämförde de två raderna för samma uppgift.
**Regel framåt:** Efter varje ändring i `docs/plan.md` eller avsnitt 11 i `docs/ARKITEKTUR.md`: lägg de två raderna för varje uppgift bredvid varandra och kräv att villkoret för att uppgiften är klar är detsamma; redovisa jämförelsen per uppgiftsnummer.

### 2026-11-20 — arkitektur (P0, omgranskning): två facit för samma sak i ARKITEKTUR.md (återfall av generell regel)
**Vad gick fel:** Avsnitt 5.2 föreskriver först `builder.Services.AddProblemDetails()` utan argument och några rader senare `AddProblemDetails(o => o.CustomizeProblemDetails = …)` (D30); och strukturreglerna i avsnitt 1 säger att tester som läser filer från disk ligger i `web/tests/`, medan `src/components/brand/Logo.test.tsx` ska jämföra geometrin med innehållet i `public/favicon.svg`.
**Varför:** Nya krav (D30, geometrijämförelsen) lades till i ett avsnitt utan att samma anrop eller regel söktes upp i resten av filen.
**Regel framåt:** När ett krav läggs till i ARKITEKTUR.md: sök anropets namn (t.ex. `AddProblemDetails`) och varje strukturregel som kravet berör, och skriv om varje träff så att alla ger samma svar i samma ändring.

### 2026-11-20 — process (P1): commitmeddelanden följer inte formen i planen
**Vad gick fel:** `docs/plan.md` ("Arbetsgång") kräver formen `typ(område): beskrivning`, men commit d459b28 heter `chore: monorepo-skelett` och 6b6ecde `chore: .gitignore, .gitattributes och .env.example`, alltså utan område (samma sak gällde P0:s commit `docs: ...`).
**Varför:** Byggaren skrev rubriken efter vana och jämförde den aldrig med formen i planen före commit.
**Regel framåt:** Före varje commit: kontrollera rubriken med `git log -1 --format=%s | grep -E '^[a-z]+\([a-z0-9-]+\): .+'` och kräv exit 0; område är katalogen eller delen som ändras (`repo`, `api`, `web`, `docs`, `ci`).

### 2026-11-20 — web (P3): testfiler i `web/tests/` typkontrolleras inte av något kommando
**Vad gick fel:** `tsconfig.app.json` har `"include": ["src"]` och `tsconfig.node.json` bara `vite.config.ts`, så en fil `web/tests/typeerr.test.ts` med `const n: number = 'text';` gav EXIT=0 i `npm run build` (K10), `npm run lint` (K8) och `npm test` (K11), lokalt och därmed i CI, fast ARKITEKTUR avsnitt 1 lägger repo-nivåtesterna där från 1.7.
**Varför:** tsconfig-filerna togs oförändrade från create-vite-mallen, som bara känner till `src/`, och ingen jämförde `include` med katalogerna i mappstrukturen; Vitest tar bort typerna utan att kontrollera dem.
**Regel framåt:** Varje katalog i ARKITEKTUR avsnitt 1 som innehåller `.ts`/`.tsx` (enligt avsnitt 1: `src/`, `tests/`, `e2e/` samt `vite.config.ts` och `playwright.config.ts` i `web/`) ska ingå i `include` i exakt en tsconfig som `tsc -b` bygger; bevisa det per katalog genom att lägga en fil med ett typfel där i en kopia och kräva att K10 ger EXIT≠0.
