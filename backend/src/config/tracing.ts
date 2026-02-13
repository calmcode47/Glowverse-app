/**
 * Tracing Configuration
 *
 * OpenTelemetry tracing is configured here. The packages are optional
 * and this module gracefully handles the case when they are not installed.
 *
 * To enable tracing, install:
 *   npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
 *   npm install @opentelemetry/sdk-trace-node @opentelemetry/resources @opentelemetry/semantic-conventions
 */

let sdk: any = null;

export const initTracing = async () => {
    try {
        // Dynamically require OpenTelemetry packages (optional dependency)
        const { NodeSDK } = await import('@opentelemetry/sdk-node' as string);
        const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node' as string);
        const { ConsoleSpanExporter } = await import('@opentelemetry/sdk-trace-node' as string);
        const { Resource } = await import('@opentelemetry/resources' as string);

        const traceExporter = new ConsoleSpanExporter();

        sdk = new NodeSDK({
            resource: new Resource({
                'service.name': 'glowverse-backend',
                'service.version': '1.0.0',
            }),
            traceExporter,
            instrumentations: [getNodeAutoInstrumentations()],
        });

        sdk.start();
        console.log('Tracing initialized');
    } catch (error) {
        console.warn('⚠️  OpenTelemetry packages not installed - tracing disabled');
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    if (sdk) {
        sdk.shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error: any) => console.error('Error terminating tracing', error))
            .finally(() => process.exit(0));
    }
});
