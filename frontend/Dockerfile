# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S next && adduser -S next -G next
ENV NODE_ENV=production

# Copy only the necessary artifacts from builder
COPY --from=builder /app/package.json /app/package-lock.json* /app/
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
# Copy next.config if you need it at runtime
COPY --from=builder /app/next.config.js /app/next.config.js

# Install only production dependencies (ensure package-lock exists)
RUN npm ci --only=production --legacy-peer-deps

# Drop privileges
USER next

# Expose port and run
ENV PORT=3000
EXPOSE 3000
CMD ["node", "./node_modules/next/dist/bin/next", "start", "-p", "3000"]
