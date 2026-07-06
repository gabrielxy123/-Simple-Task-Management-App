FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Start Next.js dev server (port 3000)
CMD ["npm", "run", "dev"]

EXPOSE 3000
