# ── Stage 1: Build dependencies ──────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev --ignore-scripts

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -S ppf && adduser -S ppf -G ppf

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove dev-only files
RUN rm -f .env.example

USER ppf

EXPOSE 4000

# Use SIGTERM for graceful shutdown
STOPSIGNAL SIGTERM

CMD ["node", "server.js"]
