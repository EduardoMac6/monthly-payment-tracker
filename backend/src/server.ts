/**
 * Server Entry Point
 * Main application server
 */

import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import { connectDatabase } from './config/database.js';

// Validate environment variables
validateEnv();

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import authRoutes from './routes/auth.routes.js';
import plansRoutes from './routes/plans.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/plans', paymentsRoutes);

// 404 handler
import { notFoundHandler } from './middleware/error.middleware.js';
app.use(notFoundHandler);

// Error handling middleware
import { errorHandler } from './middleware/error.middleware.js';
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
    try {
        // Connect to database
        await connectDatabase();

        // Start listening
        app.listen(env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`📝 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    const { disconnectDatabase } = await import('./config/database.js');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    const { disconnectDatabase } = await import('./config/database.js');
    await disconnectDatabase();
    process.exit(0);
});

// Export app for testing
export { app };

// Start the server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

