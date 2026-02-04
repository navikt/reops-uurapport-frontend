# Base stage - setup pnpm
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:25-dev AS base
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage - install all deps and build
FROM base AS build
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=secret,id=node_auth_token \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    if [ -f /run/secrets/node_auth_token ]; then \
        export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token); \
    fi && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Production deps stage - install only production dependencies
FROM base AS prod-deps
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=secret,id=node_auth_token \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    if [ -f /run/secrets/node_auth_token ]; then \
        export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token); \
    fi && \
    pnpm install --prod --frozen-lockfile --ignore-scripts

# Production stage - minimal Chainguard image
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:25.5.0@sha256:4335c1a0fd2d1622f87d6f40e97c276f8c2a7a37667c6ad472b28336cb63520e AS production
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy only production node_modules and built dist
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
