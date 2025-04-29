import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import logger from './logger';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const otlpExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

const resource = resourceFromAttributes({
  'service.name': process.env.OTEL_SERVICE_NAME || 'roman-numeral-service',
  'service.version': '1.0.0',
  'deployment.environment': process.env.NODE_ENV || 'development',
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(otlpExporter),
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
    logger.info('Tracing initialized with OLTP exporter', {
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      serviceName: process.env.OTEL_SERVICE_NAME,
    });
  } catch (error: unknown) {
    logger.error('Error initializing tracing', { error });
  }
}

export async function shutdownTracing(): Promise<void> {
  try {
    await sdk.shutdown();
    logger.info('Tracing shutdown completed');
  } catch (error: unknown) {
    logger.error('Error shutting down tracing', { error });
  }
}