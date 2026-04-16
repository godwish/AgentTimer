# Stage 1: Build the client
FROM node:20-slim AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-slim

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./

# Bring in the built static files
WORKDIR /app
COPY --from=builder /app/client/dist ./client/dist

# Create a data directory for SQLite
RUN mkdir /app/data && chown -R node:node /app/data

# Environment settings
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/timer.sqlite

EXPOSE 3000

# Use a non-root user
USER node

# Start
CMD ["npm", "start"]
