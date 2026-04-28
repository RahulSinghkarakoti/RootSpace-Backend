FROM node:20-alpine

# 1. Install necessary system libraries
RUN apk add --no-cache openssl postgresql-client

WORKDIR /usr/src/app

# 2. Copy package files
COPY package*.json ./

# 3. Install ALL dependencies (including devDeps like prisma, vitest)
RUN npm install

# 4. Copy the prisma directory specifically
COPY prisma ./prisma/

# 5. DIAGNOSTIC: List files to ensure schema is there (helpful if it fails)
RUN ls -R ./prisma

# 6. Generate Prisma Client
RUN npx prisma generate

# 7. Copy remaining source code (including test files)
COPY . .

# 8. Create logs directory
RUN mkdir -p logs

EXPOSE 5000