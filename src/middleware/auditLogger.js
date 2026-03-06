'use strict';

/**
 * Security audit logger for tracking critical operations.
 * Even without user authentication, we should log important events
 * for troubleshooting and security monitoring.
 */

const fs = require('fs');
const path = require('path');

// Use /tmp directory for production (Railway) compatibility
const logsDir = process.env.NODE_ENV === 'production' 
    ? '/tmp' 
    : path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const auditLogFile = path.join(logsDir, 'security-audit.log');

/**
 * Log security-relevant events
 * @param {string} action - Type of action (CREATE, UPDATE, DELETE, etc.)
 * @param {object} details - Event details
 */
function logAuditEvent(action, details) {
    const timestamp = new Date().toISOString();
    const event = {
        timestamp,
        action,
        ...details
    };

    const logLine = JSON.stringify(event) + '\n';
    
    // Append to audit log file asynchronously
    fs.appendFile(auditLogFile, logLine, (err) => {
        if (err) {
            console.error('[AuditLogger] Failed to write audit log:', err);
        }
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[AUDIT]', JSON.stringify(event));
    }
}

/**
 * Middleware to log all mutation requests
 */
function auditLogger(req, res, next) {
    // Only log state-changing operations
    const methodsToLog = ['POST', 'PUT', 'DELETE'];
    
    if (methodsToLog.includes(req.method)) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent') || 'Unknown';
        
        // Log after response is sent to capture status code
        res.on('finish', () => {
            logAuditEvent(`${req.method} ${req.path}`, {
                resource: req.path.split('/')[1],
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                ip: ip,
                apiKey: req.apiKey || 'Not authenticated',
                authenticated: req.authenticated || false,
                userAgent: userAgent.substring(0, 200), // Limit length
                timestamp: new Date().toISOString()
            });
        });
    }
    
    next();
}

module.exports = { logAuditEvent, auditLogger };
