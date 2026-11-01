// test/testApp.js
import express from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import routes from '../src/routes/index.js';
import errorHandler from '../src/middleware/errorHandler.js';

const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Mount real API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createTestApp;
