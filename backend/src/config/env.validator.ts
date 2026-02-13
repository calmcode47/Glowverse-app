import { z } from 'zod';
import { envSchema, type Env } from './env.schema';

// Global config storage
declare global {
    // eslint-disable-next-line no-var
    var config: Env | undefined;
}

export function validateEnv(): void {
    try {
        const parsed = envSchema.parse(process.env);

        // Store validated config globally
        global.config = parsed;

        console.log('✓ Environment variables validated successfully');
        console.log(`  - Environment: ${parsed.NODE_ENV}`);
        console.log(`  - Port: ${parsed.PORT}`);
        console.log(`  - Database: ${parsed.DATABASE_URL.split('@')[1] || 'configured'}`);
    } catch (error) {
        console.error('✗ Environment validation failed');

        if (error instanceof z.ZodError) {
            console.error('\nMissing or invalid environment variables:');
            error.issues.forEach(issue => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            console.error('\nPlease check your .env file and ensure all required variables are set.');
        }

        // Fail fast - do not start server with invalid config
        process.exit(1);
    }
}

// Type-safe access to config
export function getConfig(): Env {
    if (!global.config) {
        throw new Error('Configuration not initialized. Call validateEnv() first.');
    }
    return global.config;
}
