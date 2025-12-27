# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files from the Next.js app directory
COPY social-network/package.json social-network/package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy Next.js application source
COPY social-network/ ./

# Build the application (creates .next/standalone)
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app/socil-network

# Create a non-root user for security
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Copy only the necessary artifacts from builder
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Drop privileges
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
