'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware to run after express-validator chains.
 * Returns 422 with structured errors if validation fails.
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: 422,
            error: 'Validation failed',
            details: errors.array(),
        });
    }
    next();
}

module.exports = { validate };
