# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first for caching
COPY package.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy API server code
COPY server.mjs ./
COPY .env ./

# Expose API port
EXPOSE 4000

# Start the API server
CMD ["node", "server.mjs"]
