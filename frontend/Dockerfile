# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY frontend/package.json ./
COPY frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy built app from build stage
COPY --from=build /app/.next ./node_modules/.cache
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./next
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
