import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { globalRateLimiter } from './middleware/rateLimiterMiddleware.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initSocket } from './utils/socket.js';
import { requestLogger, logger } from './utils/logger.js';
import { setupSwagger } from './config/swagger.js';

dotenv.config();

connectDB();
configureCloudinary();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://lead-desk.app',
  'https://www.lead-desk.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost',
].filter(Boolean);

initSocket(server, allowedOrigins);

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Secure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback for dev/mobile testing
      }
    },
    credentials: true,
  })
);

// Body Parsing & Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL Injection attacks

// Request Logger
app.use(requestLogger);

// Global Rate Limiting
app.use('/api', globalRateLimiter);

// Setup Swagger OpenAPI Documentation
setupSwagger(app);

// Comprehensive Health Check API
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? 'connected' : 'disconnected';
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    message: 'AI LeadDesk Mini Enterprise API is healthy and operational',
    data: {
      status: 'healthy',
      database: status,
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Swagger API docs available at http://localhost:${PORT}/docs`);
});

export { app, server };
