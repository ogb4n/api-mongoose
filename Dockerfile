FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN yarn install

# Copy application code
COPY src/ ./src/

# Build TypeScript code
RUN yarn build

# Expose the application port
EXPOSE 4567

# Start the application
CMD ["yarn", "start"]
