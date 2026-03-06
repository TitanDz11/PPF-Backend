'use strict';

/**
 * Global Express error handler.
 * Must have exactly 4 parameters for Express to recognise it as an error handler.
 * Implements secure error handling to prevent information leakage.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const isProd = process.env.NODE_ENV === 'production';
    
    // Log full error details server-side (never expose to client)
    console.error('[ErrorHandler]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        message: err.message,
        stack: err.stack,
        user_agent: req.get('user-agent'),
        ip: req.ip
    });

    // Determine if error is safe to expose
    const isSafeError = [
        'Validation failed',
        'Vehículo no encontrado.',
        'Registro no encontrado.',
        'La placa ya está registrada.',
        'El vehículo especificado no existe.'
    ].includes(err.message);

    // Generic error messages for production to prevent information disclosure
    res.status(statusCode).json({
        status: statusCode,
        error: isProd && !isSafeError 
            ? 'An unexpected error occurred. Please try again or contact support.' 
            : err.message || 'Internal Server Error',
        ...(isProd && !isSafeError ? {} : { 
            stack: err.stack,
            details: err.details 
        }),
    });
}

module.exports = { errorHandler };
