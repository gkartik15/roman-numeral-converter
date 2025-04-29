/**
 * Prometheus metrics configuration for the Roman Numeral Converter.
 * This file sets up metrics collection for HTTP requests, response times,
 * and error rates using the prom-client library.
 */

import client from 'prom-client';
import { Request, Response } from 'express';

// Initialize default metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;

// Configure default metrics collection interval (5 seconds)
collectDefaultMetrics();

/**
 * HTTP request counter metric.
 * Tracks the total number of HTTP requests by method, route, and status code.
 */
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

/**
 * HTTP response time histogram.
 * Measures the duration of HTTP requests in seconds.
 */
const httpResponseTime = new client.Histogram({
  name: 'http_response_time_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // buckets in seconds
});

/**
 * HTTP error counter metric.
 * Tracks the number of HTTP errors by method, route, status code, and error type.
 */
const httpErrorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'error_type']
});

// Memory Usage
const processMemoryUsage = new client.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Process memory usage in bytes',
    labelNames: ['type']
});

// Update memory metrics
function updateMemoryMetrics() {
    const memoryUsage = process.memoryUsage();
    processMemoryUsage.labels('heapUsed').set(memoryUsage.heapUsed);
    processMemoryUsage.labels('heapTotal').set(memoryUsage.heapTotal);
    processMemoryUsage.labels('rss').set(memoryUsage.rss);
  }
  
// Update memory metrics every 30 seconds
setInterval(updateMemoryMetrics, 30000);

/**
 * Express middleware for collecting HTTP metrics.
 * Records request counts, response times, and errors.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function metricsMiddleware(req: Request, res: Response, next: Function) {
    const route = req.path;
    const method = req.method;
    const startTime = process.hrtime();
  
    // Record response time and update metrics on response finish
    res.on('finish', () => {
      // Calculate response time in seconds
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
  
      // Record metrics
      httpRequestCounter.labels(method, route, res.statusCode.toString()).inc();
      httpResponseTime.labels(method, route, res.statusCode.toString()).observe(duration);
  
      // Track errors (status code >= 400)
      if (res.statusCode >= 400) {
        const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
        httpErrorCounter.labels(method, route, res.statusCode.toString(), errorType).inc();
      }
    });
    next();
  }

/**
 * Prometheus metrics endpoint handler.
 * Returns metrics in Prometheus format.
 */
export async function metricsEndpoint(req: any, res: any) {
    try {
        const format = req.query.format === 'pretty' ? 'pretty' : 'prometheus';
        const metrics = await client.register.metrics();
        
        if (format === 'pretty') {
          const formattedMetrics = await formatMetrics(metrics);
          res.set('Content-Type', 'text/plain');
          res.send(formattedMetrics);
        } else {
          res.set('Content-Type', client.register.contentType);
          res.send(metrics);
        }
      } catch (error) {
        res.status(500).send('Error generating metrics');
      }
}

async function formatMetrics(metrics: string): Promise<string> {
    const lines = metrics.split('\n');
    let formatted = '=== Application Metrics Summary ===\n\n';
    
    // Group metrics by category
    const categories = {
      'Request Metrics': ['http_requests_total', 'http_active_requests'],
      'Performance Metrics': ['http_request_duration_seconds', 'roman_numeral_conversion_duration_seconds'],
      'Error Metrics': ['http_errors_total'],
      'Success Rate': ['http_success_rate_percentage'],
      'Roman Numeral Conversion': ['roman_numeral_conversions_total'],
      'System Metrics': ['process_memory_usage_bytes', 'process_cpu'],
    };
  
    for (const [category, metricNames] of Object.entries(categories)) {
      formatted += `=== ${category} ===\n\n`;
      
      for (const line of lines) {
        if (metricNames.some(name => line.includes(name))) {
          if (line.startsWith('# HELP')) {
            formatted += 'Description: ' + line.substring(7).trim() + '\n';
          } else if (line.startsWith('# TYPE')) {
            formatted += 'Type: ' + line.split(' ')[2] + '\n';
          } else if (line && !line.startsWith('#')) {
            const [name, value] = line.split(' ');
            if (name && value) {
              let labels = name.match(/\{([^}]+)\}/);
              if (labels) {
                const labelPairs = labels[1].split(',').map(pair => {
                  const [key, val] = pair.split('=');
                  return `${key}="${val.replace(/"/g, '')}"`;
                });
                formatted += `Value: ${value} (${labelPairs.join(', ')})\n`;
              } else {
                formatted += `Value: ${value}\n`;
            }
          }
        }
      }
    }
    formatted += '\n';
  }
  return formatted;
}