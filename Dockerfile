FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (for static generation or SSR if configured)
# Since we are using basic Astro, 'npm run build' generates static files in dist/
# But we used 'npm run dev' to develop. 
# For production, we can serve the 'dist' folder or run in preview mode.
# 'npm run preview' serves the built files on port 4321.

RUN npm run build

# Expose port
EXPOSE 4321

# Host should be 0.0.0.0 to be accessible outside container
ENV HOST=0.0.0.0

# Start the app in preview mode (serves the dist folder)
CMD ["npm", "run", "preview", "--", "--host"]
