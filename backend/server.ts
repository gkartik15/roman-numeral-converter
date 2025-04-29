/**
 * Main server file for the Roman Numeral Converter backend.
 * This file sets up the Express server with observability features,
 * including logging, metrics, and tracing.
 */

// Initialize OpenTelemetry first to ensure proper tracing setup
import { startTracing } from './observability/tracer';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { metricsMiddleware, metricsEndpoint } from './observability/metrics';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Create Express application instance
const app = express();

// Server configuration
const PORT = 8080;
const ENV = 'development';

// Start OpenTelemetry tracing
startTracing();

/**
 * Configure Winston logger with multiple transports:
 * - Console for immediate feedback
 * - Daily rotating files for error logs
 * - Daily rotating files for application logs
 */
const logger = winston.createLogger({
  level: ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '5m',
      maxFiles: '24h',
      level: 'error',
      zippedArchive: true
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '5m',
      maxFiles: '24h',
      zippedArchive: true
    })
  ]
});

/**
 * Global error handling middleware.
 * Catches any unhandled errors in the application and logs them.
 */
app.use((err: Error, req: Request, res: Response, next: Function) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * CORS configuration based on environment.
 * In development, allows requests from localhost:3000.
 * In production, should be updated with the actual frontend domain.
 */
const corsOptions = {
    origin: ENV === 'development' 
      ? ['http://localhost:3000']
      : ['https://your-production-domain.com'], // Update with your actual production domain
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
  };

// Apply CORS middleware
app.use(cors(corsOptions));

// Add Prometheus metrics middleware
app.use(metricsMiddleware);

/**
 * Health check endpoint.
 * Used by Docker health checks and monitoring systems.
 * Returns service status, environment, and timestamp.
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'healthy',
      environment: ENV,
      timestamp: new Date().toISOString()
    });
  });

// Expose Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

/**
 * Main Roman numeral conversion endpoint.
 * Converts a number between 1 and 3999 to its Roman numeral representation.
 * 
 * @param {string} query - The number to convert (must be between 1 and 3999)
 * @returns {Object} JSON response with input and output
 * @throws {Error} If input is invalid or out of range
 */
app.get('/romannumeral', (req: Request, res: Response): Response => {
  const query = req.query.query as string;
  
  if (!query) {
    logger.error('Missing query parameter', { path: req.path });
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  logger.info('Received request', { query });

  const num = parseInt(query, 10);

  /**
   * Roman numeral mapping.
   * Each entry represents a value and its corresponding Roman numeral.
   * The array is ordered from highest to lowest value to ensure proper conversion.
   */
  const romanMap: { value: number; numeral: string }[] = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  
  /**
   * Converts a number to its Roman numeral representation.
   * Follows the standard described in https://en.wikipedia.org/wiki/Roman_numerals
   * Supports numbers between 1 and 3999 inclusive.
   * 
   * @param {number} num - The number to convert
   * @returns {string} The Roman numeral representation
   */
  function toRoman(num: number): string {
    let result = '';
    for (const { value, numeral } of romanMap) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }

  if (isNaN(num)) {
    logger.error('Invalid number format', { query });
    return res.status(400).json({ error: 'Invalid number format' });
  }

  if (num < 1 || num > 3999) {
    logger.error('Number out of range', { query, num });
    return res.status(400).json({ error: 'Number must be between 1 and 3999' });
  }

  try {
    const roman = toRoman(num);
    logger.info('Conversion successful', { input: num, output: roman });
    return res.json({ input: query, output: roman });
  } catch (error) {
    logger.error('Conversion failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      input: num 
    });
    return res.status(500).json({ error: 'Internal server error during conversion' });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running in ${ENV} mode at http://localhost:${PORT}`);
});