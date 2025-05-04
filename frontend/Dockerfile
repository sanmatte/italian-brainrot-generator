# src/frontend/Dockerfile

# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
# Use 'npm ci' for cleaner installs in CI/CD or Docker, falls back to 'npm install' if no lock file
RUN npm ci || npm install

# Copy the rest of the frontend application code
COPY . .

# Build the application (output typically goes to 'dist' or 'build' folder)
# Check your package.json "build" script if unsure
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build files from the 'build' stage
# IMPORTANT: Verify your build output directory ('dist' is common for Vite)
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Nginx default command runs automatically, or add:
# CMD ["nginx", "-g", "daemon off;"]
