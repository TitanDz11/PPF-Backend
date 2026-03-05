'use strict';

require('dotenv').config();

const { createApp } = require('./src/app');
const { connectWithRetry, closePool } = require('./src/db/connection');
const { runMigrations } = require('./src/db/migrations');
const config = require('./src/config/env');

let server;

async function start() {
    // 1. Establish DB connection with retry
    await connectWithRetry();

    // 2. Auto-create database + tables if they don't exist
    await runMigrations();

    // 3. Boot HTTP server
    const app = createApp();
    server = app.listen(config.server.port, () => {
        console.log(`[Server] Listening on port ${config.server.port} (${config.server.nodeEnv})`);
    });

    server.on('error', (err) => {
        console.error('[Server] Fatal server error:', err);
        process.exit(1);
    });
}

/**
 * Graceful shutdown – waits for in-flight requests to finish,
 * then closes the DB pool. No race conditions: we sequence these steps.
 */
async function shutdown(signal) {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully…`);
    if (server) {
        server.close(async () => {
            console.log('[Server] HTTP server closed.');
            await closePool();
            process.exit(0);
        });

        // Force-exit after 15 seconds if still draining
        setTimeout(() => {
            console.error('[Server] Forceful shutdown after timeout.');
            process.exit(1);
        }, 15_000).unref();
    } else {
        await closePool();
        process.exit(0);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    console.error('[Process] Uncaught exception:', err);
    shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    console.error('[Process] Unhandled rejection:', reason);
    shutdown('unhandledRejection');
});

start().catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
});
