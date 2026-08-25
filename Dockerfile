# Base stage - Chainguard Node.js image with pnpm
FROM cgr.dev/chainguard/node:latest-dev AS base
USER root
RUN apk update && apk add --no-cache pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p "$PNPM_HOME" && chown -R node:node "$PNPM_HOME"
USER node

# Build stage - install all deps and build
FROM base AS build
WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN,uid=65532,required=false \
    --mount=type=cache,id=pnpm,target=/pnpm/store,uid=65532 \
    if [ -f /run/secrets/NODE_AUTH_TOKEN ]; then \
        pnpm config set "//npm.pkg.github.com/:_authToken" "$(cat /run/secrets/NODE_AUTH_TOKEN)"; \
    fi && \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .
ENV CI=true
RUN pnpm run build

# Production stage - minimal Node.js image (no Go stdlib, no pnpm)
FROM cgr.dev/chainguard/node@sha256:f2a8ed64ec02cef2e53c76d1255d0917e749570af251e32e99f54cda1076cc8d AS production
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy standalone server and dependencies
COPY --from=build /usr/src/app/.next/standalone ./
# Copy static files
COPY --from=build /usr/src/app/.next/static ./.next/static

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["server.js"]

EXPOSE $PORT
