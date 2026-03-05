'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Too many requests, please try again later.',
    },
    handler(req, res, _next, options) {
        res.status(options.message.status).json(options.message);
    },
});

module.exports = { limiter };
