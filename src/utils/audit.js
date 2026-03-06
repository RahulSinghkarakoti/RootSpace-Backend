// src/utils/audit.js
// Fire-and-forget audit logger — never throws so it can't break request flow

import prisma  from '../config/prisma.js';
import logger  from './logger.js';

/**
 * @param {object} opts
 * @param {string|null} opts.userId
 * @param {string}      opts.action   e.g. 'LOGIN', 'LOGOUT', 'PASSWORD_RESET'
 * @param {string}      [opts.entity]
 * @param {string}      [opts.entityId]
 * @param {object}      [opts.metadata]
 * @param {object}      [opts.req]    Express request (for IP + UA)
 */
const audit = async ({ userId = null, action, entity, entityId, metadata, req }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity:    entity   ?? null,
        entityId:  entityId ?? null,
        metadata:  metadata ?? undefined,
        ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null,
        userAgent: req ? req.headers['user-agent'] : null,
      },
    });
  } catch (err) {
    logger.error('Audit log failed:', err);
  }
};

export { audit };