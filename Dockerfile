# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app to dist/
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

# No need for host env or preview cmd, Nginx handles it
CMD ["nginx", "-g", "daemon off;"]
