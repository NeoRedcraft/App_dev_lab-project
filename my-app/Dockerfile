# Use specific Node version
FROM node:24.13.0

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json* ./

# Install exact dependencies from package-lock.json
RUN npm ci

# Copy the rest of the project files
COPY . .

# Expose Vite dev server port
EXPOSE 5174

# Default command to start Vite
CMD ["npm", "run", "dev"]
