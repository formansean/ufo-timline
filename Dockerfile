# Multi-stage build for optimized Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Development stage with hot reload support
FROM deps AS development
WORKDIR /app
COPY . .
# Note: Prisma generation removed - app currently uses static data
# TODO: Re-enable when Prisma schema is created and dependencies installed
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy only necessary files for build
COPY next.config.ts .
COPY tsconfig.json .
COPY postcss.config.mjs .
COPY eslint.config.mjs .
COPY package*.json .
# COPY prisma ./prisma/  # Commented out - no prisma directory yet
COPY public ./public/
COPY src ./src/

# Generate Prisma client for build
# RUN npx prisma generate  # Commented out - using static data currently

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Use the Docker-optimized build command with Turbopack
RUN npm run build:docker

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install necessary runtime dependencies for Prisma
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Prisma files and generated client for production
# COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/  # Not available yet
# COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/  # Not available yet  
# COPY --from=builder /app/prisma ./prisma/  # Not available yet

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change ownership of Prisma files
# RUN chown -R nextjs:nodejs ./node_modules/.prisma ./node_modules/@prisma ./prisma  # Not needed yet

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]