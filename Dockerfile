# Base stage - Chainguard Node.js image with pnpm
FROM cgr.dev/chainguard/node:latest-dev AS base
USER root
RUN apk update && apk add --no-cache pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
USER node

# Build stage - install all deps and build
FROM base AS build
WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN,uid=65532,required=false \
    --mount=type=cache,id=pnpm,target=/pnpm/store,uid=65532 \
    if [ -f /run/secrets/NODE_AUTH_TOKEN ]; then \
        export NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN); \
    fi && \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .
RUN pnpm run build

# Production stage - minimal Node.js image (no Go stdlib, no pnpm)
FROM cgr.dev/chainguard/node@sha256:e30593ef2eb6736f4ba95ad6dd8da1dbcd58518d0ca01ba2eb34a34cf9c43464 AS production
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
