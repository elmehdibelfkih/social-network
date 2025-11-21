FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --silent || npm install --silent

FROM node:18-alpine AS builder
WORKDIR /app

# copy node_modules from deps and project files
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3 — runner: production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# copy only what is needed to run
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
# copy next.config if used (optional)
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
