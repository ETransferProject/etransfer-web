FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check GitHub - nodejs/docker-node at b4117f9333da4138b03a546ec926ef50a31506c3 to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi


# Rebuild the source code only when needed
FROM base AS builder
ARG NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY
ARG NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID
ARG NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID
ARG NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID
ARG NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_SOL_ENDPOINT
ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
ENV NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY=${NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY}
ENV NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID=${NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID}
ENV NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID=${NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID}
ENV NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID=${NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID}
ENV NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID=${NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID}
ENV NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
ENV NEXT_PUBLIC_SOL_ENDPOINT=${NEXT_PUBLIC_SOL_ENDPOINT}

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f yarn.lock ]; then yarn run build:${ENVIRONMENT}; \
    elif [ -f package-lock.json ]; then  npm run build:${ENVIRONMENT}; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build:${ENVIRONMENT}; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
ARG NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY
ARG NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID
ARG NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID
ARG NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_SOL_ENDPOINT
ARG NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID
ARG NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID
ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
ENV NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY=${NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY}
ENV NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID=${NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID}
ENV NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID=${NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID}
ENV NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_TESTNET_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_MAINNET_RECAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID=${NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID}
ENV NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID=${NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID}
ENV NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
ENV NEXT_PUBLIC_SOL_ENDPOINT=${NEXT_PUBLIC_SOL_ENDPOINT}

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder --chown=nextjs:nodejs /app/public ./
# COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js
# COPY --from=builder --chown=nextjs:nodejs /app/build.config ./build.config
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

COPY --from=builder --chown=nextjs:nodejs /app ./
COPY package.json ./

USER nextjs

EXPOSE 3011

ENV PORT 3011

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" yarn start