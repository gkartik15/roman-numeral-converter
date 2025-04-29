import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { logger } from './logger';
import { diag } from '@opentelemetry/api';
import { DiagLogLevel } from '@opentelemetry/api';

// Set OpenTelemetry to only log errors
const otelLogger = {
  error(message: string) {
    // Write to a separate file for OpenTelemetry errors
    logger.error(`[OpenTelemetry] ${message}`, { component: 'opentelemetry' });
  },
  warn(message: string) {
    // Only log warnings if really needed
    if (process.env.LOG_LEVEL === 'debug') {
      logger.warn(`[OpenTelemetry] ${message}`, { component: 'opentelemetry' });
    }
  },
  info() {}, // Don't log info messages
  debug() {}, // Don't log debug messages
  verbose() {}, // Don't log verbose messages
};

// Configure the OpenTelemetry diagnostic logger
diag.setLogger(otelLogger, DiagLogLevel.ERROR);

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
  host: process.env.JAEGER_AGENT_HOST || 'jaeger',
  port: parseInt(process.env.JAEGER_AGENT_PORT || '6831', 10),
});

const resource = resourceFromAttributes({
  'service.name': process.env.JAEGER_SERVICE_NAME || 'roman-numeral-service',
  'service.version': '1.0.0',
  'deployment.environment': process.env.NODE_ENV || 'development',
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(jaegerExporter),
  instrumentations: [
    new ExpressInstrumentation({
        requestHook: (span, request: any) => {
        span.setAttribute('http.request.query', JSON.stringify(request.params));
        },
    }),
    new HttpInstrumentation({
      requestHook: (span, request) => {
        span.setAttribute('http.request.start_time', Date.now());
      },
      responseHook: (span, response) => {
        span.setAttribute('http.response.end_time', Date.now());
      },
    }),
  ],
});

export async function startTracing(): Promise<void> {
  try {
    await sdk.start();
    logger.info('Tracing initialized with Jaeger exporter', {
      component: 'opentelemetry',
      agentHost: process.env.JAEGER_AGENT_HOST,
      agentPort: process.env.JAEGER_AGENT_PORT,
      serviceName: process.env.JAEGER_SERVICE_NAME,
    });
  } catch (error: unknown) {
    logger.error('Error initializing tracing', { 
      component: 'opentelemetry',
      error 
    });
  }
}

export async function shutdownTracing(): Promise<void> {
  try {
    await sdk.shutdown();
    logger.info('Tracing shutdown completed', { component: 'opentelemetry' });
  } catch (error: unknown) {
    logger.error('Error shutting down tracing', { 
      component: 'opentelemetry',
      error 
    });
  }
}