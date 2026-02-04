# Base stage - setup Node.js and pnpm on Wolfi
FROM cgr.dev/chainguard/wolfi-base:latest AS base
RUN apk update && apk add --no-cache nodejs-25 pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

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

# Production stage - minimal Wolfi base with Node.js only
FROM cgr.dev/chainguard/wolfi-base:latest AS production
RUN apk update && apk add --no-cache nodejs-25
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy only production node_modules and built dist
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT
