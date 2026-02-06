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
FROM cgr.dev/chainguard/node@sha256:d1af9eb3a1eab9d23c9f1d987313c1fd2444d8bdcbe283f4c6a69a93568c6fd5 AS production
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy Next.js build output and node_modules
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node_modules/.bin/next", "start"]

EXPOSE $PORT
