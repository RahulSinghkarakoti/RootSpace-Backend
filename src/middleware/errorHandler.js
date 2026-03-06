import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found' });
  }

  // Operational / known errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Unknown errors — log full stack, return generic message
  logger.error('Unhandled error:', err);

  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
    ...(isProd ? {} : { stack: err.stack }),
  });
};

export default errorHandler;