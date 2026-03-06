'use strict';

const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/env');

/**
 * Configure CORS with strict origin validation.
 * Even in internal systems, we should validate origins.
 */
const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : [config.cors.origin || 'http://localhost:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
    optionsSuccessStatus: 200,
};

/**
 * Applies security headers (helmet) and CORS to the Express app.
 * Configured for internal application use without authentication.
 */
function applySecurityMiddleware(app) {
    // Enhanced Helmet configuration for better protection
    app.use(helmet({
        contentSecurityPolicy: false, // Disabled for internal app compatibility
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        xssFilter: true,
    }));
    
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    
    // Add security headers manually for additional control
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // XSS Protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });
}

module.exports = { applySecurityMiddleware };
