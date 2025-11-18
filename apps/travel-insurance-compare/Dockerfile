# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY package*.json ./
COPY turbo.json .
COPY .npmrc* ./

# Copy app and packages
COPY apps/travel-insurance-compare ./apps/travel-insurance-compare
COPY packages ./packages

# Install dependencies
RUN npm ci

# Build app
WORKDIR /app
RUN npm run build -- --filter=travel-insurance-compare

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

# Copy root files
COPY package*.json ./
COPY .npmrc* ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built app
COPY --from=builder /app/apps/travel-insurance-compare/.next ./apps/travel-insurance-compare/.next
COPY --from=builder /app/apps/travel-insurance-compare/public ./apps/travel-insurance-compare/public
COPY --from=builder /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

WORKDIR /app/apps/travel-insurance-compare

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
