'use strict';

/**
 * Simple API Key authentication middleware.
 * Provides basic access control without full user management.
 * Suitable for internal systems with trusted clients.
 */

const API_KEYS = process.env.API_KEYS 
    ? process.env.API_KEYS.split(',').map(key => key.trim())
    : [];

/**
 * Middleware to validate API key from request headers.
 * Expects header: X-API-Key: your-secret-key
 */
function authenticate(req, res, next) {
    // Skip authentication in development if no keys configured
    if (process.env.NODE_ENV !== 'production' && API_KEYS.length === 0) {
        console.warn('[WARN] API authentication disabled - no API_KEYS configured');
        return next();
    }

    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            status: 401,
            error: 'API key required. Please provide X-API-Key header.',
            documentation: 'Contact administrator to obtain an API key.'
        });
    }

    if (!API_KEYS.includes(apiKey)) {
        // Log failed attempt
        console.warn('[AUTH] Invalid API key attempt from IP:', req.ip);
        
        return res.status(403).json({
            status: 403,
            error: 'Invalid API key.',
            message: 'The provided API key is not authorized to access this system.'
        });
    }

    // Attach API key info to request for audit logging
    req.apiKey = apiKey.substring(0, 8) + '...'; // Store partial key for logging
    req.authenticated = true;
    
    next();
}

/**
 * Optional authentication - allows requests without API key
 * but marks them as unauthenticated for rate limiting
 */
function optionalAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey && API_KEYS.includes(apiKey)) {
        req.apiKey = apiKey.substring(0, 8) + '...';
        req.authenticated = true;
    } else {
        req.authenticated = false;
    }
    
    next();
}

module.exports = { authenticate, optionalAuth };
