# Build stage - install deps and build
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:25-dev AS build
USER root
WORKDIR /usr/src/app

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=secret,id=node_auth_token \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    if [ -f /run/secrets/node_auth_token ]; then \
        export NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token); \
    fi && \
    pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Production stage - minimal Chainguard image
FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:25-slim AS production
LABEL maintainer="team-researchops"
WORKDIR /usr/src/app

# Copy node_modules and built dist from build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["./dist/server/entry.mjs"]

EXPOSE $PORT