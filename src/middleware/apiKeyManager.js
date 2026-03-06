'use strict';

/**
 * Advanced API Key management system with metadata and permissions.
 * Provides granular control without full user authentication.
 */

const fs = require('fs');
const path = require('path');

// Path to store API key configuration
const keysConfigPath = path.join(__dirname, '../../config/api-keys.json');

/**
 * Load API keys from configuration file
 * Format:
 * {
 *   "keys": [
 *     {
 *       "key": "your-api-key-here",
 *       "name": "Frontend App",
 *       "permissions": ["read", "write"],
 *       "rateLimit": 100,
 *       "active": true,
 *       "createdAt": "2024-01-01T00:00:00Z",
 *       "expiresAt": null // or specific date
 *     }
 *   ]
 * }
 */
function loadKeysConfig() {
    try {
        if (fs.existsSync(keysConfigPath)) {
            const data = fs.readFileSync(keysConfigPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('[API Keys] Error loading config:', err.message);
    }
    
    // Default structure if file doesn't exist
    return {
        keys: []
    };
}

/**
 * Save API keys configuration
 */
function saveKeysConfig(config) {
    try {
        const dir = path.dirname(keysConfigPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(keysConfigPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('[API Keys] Error saving config:', err.message);
        return false;
    }
}

/**
 * Validate API key with enhanced checks
 */
function validateApiKey(apiKey) {
    const config = loadKeysConfig();
    const keyConfig = config.keys.find(k => k.key === apiKey);
    
    if (!keyConfig) {
        return { valid: false, reason: 'Invalid API key' };
    }
    
    // Check if key is active
    if (!keyConfig.active) {
        return { valid: false, reason: 'API key is deactivated' };
    }
    
    // Check expiration
    if (keyConfig.expiresAt) {
        const expiry = new Date(keyConfig.expiresAt);
        if (expiry < new Date()) {
            return { valid: false, reason: 'API key has expired' };
        }
    }
    
    return {
        valid: true,
        keyConfig: keyConfig,
        permissions: keyConfig.permissions || ['read'],
        rateLimit: keyConfig.rateLimit || 100
    };
}

/**
 * Generate a secure random API key
 */
function generateApiKey() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new API key
 */
function createApiKey(options) {
    const config = loadKeysConfig();
    const newKey = {
        key: generateApiKey(),
        name: options.name || 'Unnamed Key',
        permissions: options.permissions || ['read'],
        rateLimit: options.rateLimit || 100,
        active: true,
        createdAt: new Date().toISOString(),
        expiresAt: options.expiresAt || null,
        lastUsed: null,
        usageCount: 0
    };
    
    config.keys.push(newKey);
    
    if (saveKeysConfig(config)) {
        return newKey;
    }
    
    return null;
}

/**
 * Revoke an API key
 */
function revokeApiKey(keyId) {
    const config = loadKeysConfig();
    const keyIndex = config.keys.findIndex(k => k.key === keyId);
    
    if (keyIndex === -1) {
        return false;
    }
    
    config.keys[keyIndex].active = false;
    config.keys[keyIndex].revokedAt = new Date().toISOString();
    
    return saveKeysConfig(config);
}

/**
 * Update key usage statistics
 */
function updateKeyUsage(apiKey) {
    const config = loadKeysConfig();
    const keyConfig = config.keys.find(k => k.key === apiKey);
    
    if (keyConfig) {
        keyConfig.lastUsed = new Date().toISOString();
        keyConfig.usageCount = (keyConfig.usageCount || 0) + 1;
        saveKeysConfig(config);
    }
}

/**
 * Middleware for advanced API key authentication
 */
function advancedAuth(req, res, next) {
    // Skip in development if no keys configured
    if (process.env.NODE_ENV !== 'production') {
        const envKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
        if (envKeys.length === 0) {
            console.warn('[WARN] Using fallback environment API keys');
            const apiKey = req.headers['x-api-key'];
            if (apiKey && envKeys.includes(apiKey)) {
                req.apiKey = apiKey.substring(0, 8) + '...';
                req.authenticated = true;
                req.permissions = ['read', 'write', 'delete'];
            } else {
                req.authenticated = false;
                req.permissions = ['read', 'write', 'delete'];
            }
            return next();
        }
    }
    
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            status: 401,
            error: 'API key required',
            documentation: 'Provide X-API-Key header with your API key'
        });
    }
    
    const validation = validateApiKey(apiKey);
    
    if (!validation.valid) {
        console.warn(`[AUTH] Invalid API key attempt: ${validation.reason}`);
        return res.status(403).json({
            status: 403,
            error: validation.reason
        });
    }
    
    // Attach key info to request
    req.apiKey = apiKey.substring(0, 8) + '...';
    req.keyId = apiKey; // Full key for internal use
    req.authenticated = true;
    req.permissions = validation.permissions;
    req.customRateLimit = validation.rateLimit;
    
    // Update usage stats asynchronously
    updateKeyUsage(apiKey);
    
    next();
}

module.exports = {
    validateApiKey,
    generateApiKey,
    createApiKey,
    revokeApiKey,
    updateKeyUsage,
    advancedAuth,
    loadKeysConfig
};
