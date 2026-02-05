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
RUN --mount=type=secret,id=node_auth_token,uid=65532 \
    --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000 \
    export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token) && \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .
RUN pnpm run build

# Production stage - minimal Node.js image (no Go stdlib, no pnpm)
FROM cgr.dev/chainguard/node:latest AS production
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy built dist and ALL node_modules (Astro needs full dependency tree at runtime)
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
