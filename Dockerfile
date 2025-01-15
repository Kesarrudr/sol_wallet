# Step 1: Base Image for Dependencies
FROM node:20-alpine AS deps

# Install required packages for building native modules
RUN apk update && apk add --no-cache \
  make gcc g++ libc6-compat bash python3 py3-pip \
  linux-headers eudev-dev libusb-dev

# Install node-gyp and prebuild globally
RUN yarn global add node-gyp prebuild

WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./

# Set the Python environment variable for node-gyp
ENV PYTHON=/usr/bin/python3

# Install Node.js dependencies
RUN yarn install

# Step 2: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN yarn run build

# Step 3: Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Install required runtime libraries
RUN apk add --no-cache python3 py3-pip libusb eudev

# Create and set permissions for the cache directory
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app

# Copy the built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the required port
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["sh", "-c", "PORT=8080 node server.js"]

