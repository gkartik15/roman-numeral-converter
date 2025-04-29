# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Add build arguments
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

# Install necessary tools and create machine-id
RUN apk add --no-cache curl dbus && \
    dbus-uuidgen > /etc/machine-id

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chmod 777 /app/logs

# Add environment argument
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN npm ci --only=production

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]