# Phase 2: Dockerfile optimized for Node.js production

# 1. Use a lightweight Alpine base image
FROM node:20-alpine

# 2. Set environment variable to production
ENV NODE_ENV=production

# 3. Set the working directory
WORKDIR /usr/src/app

# 4. Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# 5. Copy the rest of the backend source code
COPY . .

# 6. Switch to the non-root 'node' user provided by the base image
USER node

# 7. Expose the standard Express port
EXPOSE 5000

# 8. Set the startup command to standard Node execution
CMD ["node", "server.js"]
