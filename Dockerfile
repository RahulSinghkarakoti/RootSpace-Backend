FROM node:20-alpine

# 1. Install necessary system libraries
RUN apk add --no-cache openssl postgresql-client

WORKDIR /usr/src/app

# 2. Copy package files
COPY package*.json ./

# 3. Install dependencies without running the Prisma postinstall too early
RUN npm install --ignore-scripts

# 4. Copy remaining source code (including Prisma schema, config, and test files)
COPY . .

# 5. Generate Prisma Client
RUN npx prisma generate

# 6. Create logs directory
RUN mkdir -p logs

EXPOSE 5000
CMD ["npm", "start"]