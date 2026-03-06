'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * General API rate limiter - protects against brute force and DoS attacks.
 * Even without user auth, we need to protect system resources.
 */
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    handler(req, res, _next, options) {
        res.status(options.message.status).json(options.message);
    },
});

/**
 * Stricter limiter for mutation operations (POST, PUT, DELETE).
 * Prevents rapid data manipulation that could corrupt database.
 */
const mutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Only 20 mutation operations per 15 min
    message: {
        status: 429,
        error: 'Too many modification attempts. Please slow down.',
        retryAfter: 900
    },
    methods: ['POST', 'PUT', 'DELETE'],
});

/**
 * Very strict limiter for delete operations specifically.
 * Destructive actions should have extra protection.
 */
const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 deletions per 15 min
    message: {
        status: 429,
        error: 'Too many deletion attempts. This limit prevents accidental data loss.',
        retryAfter: 900
    },
    methods: ['DELETE'],
});

module.exports = { limiter, mutationLimiter, deleteLimiter };
