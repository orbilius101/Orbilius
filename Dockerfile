# Use official Node.js LTS image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only package.json and pnpm-lock.yaml first for caching
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy API server code
COPY server.mjs ./
COPY .env ./

# Expose API port
EXPOSE 4000

# Start the API server
CMD ["node", "server.mjs"]
