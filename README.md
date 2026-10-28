# uurapport frontend

[uurapport](https://uurapport.ansatt.nav.no/) dekker behovet for intern rapportering av tilgjengelighetsstatusen av Navs produkter og tjenester.

# Utvikling

Dette repoet bruker [PNPM](https://pnpm.io/), siden pnpm har [litt mer fokus på sikkerhet](https://pnpm.io/supply-chain-security) en det npm har, feks disabler de install scripts by default, og har en fin `minimumReleaseAge` config. litt mer info her: https://sikkerhet.nav.no/docs/sikker-utvikling/frontend

## Kjøre applikasjonen lokalt (anbefalt: med ekte backend)

Dette gir ekte data, ekte tilgangsstyring (admin vs. vanlig bruker, team-medlemskap) og tester hele flyten, inkludert arkivering og sletting.

1. Start backend og database, se [reops-uurapport-backend](../reops-uurapport-backend/README.md#kjøre-appen-lokalt):
   `docker-compose up` (starter også mock-oauth2-server som frontend henter token fra), og start deretter backend med `SKIP_AUTH=true` (og `SKIP_AUTH_ROLE=user` for vanlig bruker).
2. Legg inn testdata (én gang, mens backend kjører som admin): `../reops-uurapport-backend/scripts/seed-local.sh`
3. Installer dependencies: `pnpm install`
4. Start Next.js: `pnpm run dev`
5. Åpne `http://localhost:3001`

I `local`-modus går API-kall direkte til backend på `http://localhost:8787` — ingen wonderwall, ingen innlogging. Rollen bestemmes av hvordan backend ble startet (`SKIP_AUTH_ROLE`), og du bytter ved å starte backend på nytt.

Kontaktinformasjon fra Teamkatalogen hentes fra prod-API-et og krever at du er på Nav-nettverket (naisdevice). Uten det vises i stedet en generell henvisning til #nav-uu.

## Kjøre med mock (frarådes, kun for rask UI-utforsking)

Mock-serveren har faste, håndskrevne data og etterligner ikke backends tilgangsregler, så den er lett å bli lurt av. Bruk ekte backend over når du tester funksjonalitet.

1. Installer dependencies: `pnpm install`
2. Få opp Next.js-appen og mock-server: `pnpm run mock-dev`

Velg innlogget rolle i mock-modus:

- `pnpm run mock-dev:admin` – administrator (standard for `mock-dev`): kan slette permanent og redigere alle rapporter
- `pnpm run mock-dev:user` – vanlig bruker: ingen permanent sletting. Kan redigere vanlige rapporter (også teamets), men ikke samlerapporter eller de «mangled» testrapportene (de viser skrivebeskyttet visning)

bare mock server:

1. Få opp mock-server: `pnpm run mock`

## Lokal docker image

### bygg

For å bygge Docker imaget lokalt trenger du en `NODE_AUTH_TOKEN` miljøvariabel for tilgang til @navikt packages fra GitHub Package Registry:
(denne har du gjerne allerede i `~/.npmrc`)

```bash
export NODE_AUTH_TOKEN=<your-github-token>
docker build --secret id=NODE_AUTH_TOKEN . -t reops-uurapport-frontend
```

På CI/CD vil `NODE_AUTH_TOKEN` automatisk være tilgjengelig via `GITHUB_TOKEN`.

### run

```bash
docker run --rm -it -p 3000:3000 reops-uurapport-frontend
```

Applikasjonen vil være tilgjengelig på http://localhost:3000

Obs: Husk at den prøver å få tilgang til tokens, som du sikkert ikke har på lokal maskin. bruk heller `pnpm run dev` mot lokal backend, se over.

## Endpoints

En oversikt over endepunkter: https://uurapport.ekstern.dev.nav.no/static/openapi
