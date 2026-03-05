'use strict';

const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/env');

const corsOptions = {
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
};

/**
 * Applies security headers (helmet) and CORS to the Express app.
 * @param {import('express').Application} app
 */
function applySecurityMiddleware(app) {
    app.use(helmet());
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
}

module.exports = { applySecurityMiddleware };
