/**
 * Winston logger configuration for the Roman Numeral Converter.
 * This file sets up a centralized logging system using Winston,
 * providing consistent logging across the application.
 */

import { createLogger, transports, format } from 'winston';

/**
 * Creates a Winston logger instance with the following configuration:
 * - Log level: 'info' by default
 * - Format: Timestamp and message with optional metadata
 * - Transport: Console output
 * 
 * Additional transports (file, etc.) can be added as needed.
 */
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});