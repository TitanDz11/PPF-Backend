'use strict';

/**
 * Global Express error handler.
 * Must have exactly 4 parameters for Express to recognise it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const isProd = process.env.NODE_ENV === 'production';

    console.error('[ErrorHandler]', err);

    res.status(statusCode).json({
        status: statusCode,
        error: err.message || 'Internal Server Error',
        ...(isProd ? {} : { stack: err.stack }),
    });
}

module.exports = { errorHandler };
