# Step 1: Base Image for Dependencies
FROM node:18-alpine3.18 AS deps
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

# Install Python dependencies first

# Install Node.js dependencies
RUN yarn install

# Step 2: Build Stage
FROM node:18-alpine3.18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the project
RUN yarn run build

# Step 3: Runner Stage
FROM node:18-alpine3.18 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install Python, pip, and necessary libraries for USB support
RUN apk add --no-cache python3 py3-pip libusb eudev

# COPY --from=builder /app/public ./public


RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install Python dependencies

USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "PORT=8080 node server.js"]
