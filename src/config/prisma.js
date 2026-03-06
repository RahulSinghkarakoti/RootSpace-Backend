// src/config/prisma.js
// Singleton Prisma client — avoids exhausting connection pool in dev hot-reload

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  // Log queries in development only
  // prisma.$on('query', (e) => {
  //   logger.debug(`Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
  // });
}

prisma.$on('error', (e) => logger.error('Prisma Error:', e));
prisma.$on('warn',  (e) => logger.warn('Prisma Warn:', e));

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;