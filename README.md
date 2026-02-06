# uurapport frontend

[uurapport](https://uurapport.ansatt.nav.no/) dekker behovet for intern rapportering av tilgjengelighetsstatusen av Navs produkter og tjenester.

# Utvikling

Dette repoet bruker [PNPM](https://pnpm.io/), siden pnpm har [litt mer fokus på sikkerhet](https://pnpm.io/supply-chain-security) en det npm har, feks disabler de install scripts by default, og har en fin `minimumReleaseAge` config. litt mer info her: https://sikkerhet.nav.no/docs/sikker-utvikling/frontend

## Kjøre applikasjonen lokalt med mock

1. Installer dependencies: `pnpm install`
2. Få opp Next.js-appen og mock-server: `pnpm run mock-dev`

bare mock server:

1. Få opp mock-server: `pnpm run mock`

## Kjøre applikasjonen lokalt med ekte backend

1. Installer dependencies: `pnpm install`
2. Få opp Next.js-appen: `pnpm run dev`

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

Obs: Husk at den prøver å få tilgang til tokens, som du sikkert ikke har på lokal maskin. bruk heller mocking `pnpm run mock-dev` for lokal utvikling / test for nå.

## Endpoints

En oversikt over endepunkter: https://uurapport.ekstern.dev.nav.no/static/openapi
