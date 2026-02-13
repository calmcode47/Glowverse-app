
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configure the SDK to export telemetry data to the console
// In production, this would be replaced with OTLPTraceExporter to send to Jaeger/Zipkin
const traceExporter = new ConsoleSpanExporter();

const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'glowverse-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
});

// Initialize the SDK and register with the OpenTelemetry API
// this serves as a singleton entry point for tracing
export const initTracing = async () => {
    try {
        sdk.start();
        console.log('Tracing initialized');
    } catch (error) {
        console.error('Error initializing tracing', error);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.error('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
