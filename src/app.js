'use strict';

const express = require('express');
const morgan = require('morgan');

const { applySecurityMiddleware } = require('./middleware/security');
const { limiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/apiAuth');

const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const entryRoutes = require('./modules/entries/entry.routes');

/**
 * Factory function – creates and configures the Express application.
 * Separating factory from server.js allows us to test in isolation.
 * @returns {import('express').Application}
 */
function createApp() {
    const app = express();

    // ── Security ──────────────────────────────────────────────────────────
    applySecurityMiddleware(app);

    // ── Rate limiter ──────────────────────────────────────────────────────
    app.use('/api/', limiter);

    // ── Request size limits ───────────────────────────────────────────────
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: false, limit: '500kb' }));

    // ── Query string length limit ─────────────────────────────────────────
    app.use((req, res, next) => {
        if (req.url && req.url.length > 2048) {
            return res.status(414).json({ 
                status: 414,
                error: 'URI Too Long. Please reduce the length of your request.' 
            });
        }
        next();
    });

    // ── Request logging ───────────────────────────────────────────────────
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

    // ── Health check (public, no auth required) ───────────────────────────
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // ── API Routes ────────────────────────────────────────────────────────
    // Apply API key authentication to all routes except health check
    app.use('/api/', authenticate);
    
    app.use('/api/vehicles', vehicleRoutes);
    app.use('/api/entries', entryRoutes);

    // ── 404 ───────────────────────────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({ error: 'Ruta no encontrada.' });
    });

    // ── Global error handler ──────────────────────────────────────────────
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
