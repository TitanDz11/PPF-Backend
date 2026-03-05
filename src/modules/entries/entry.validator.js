'use strict';

const { body, param, query } = require('express-validator');

const entryCreateRules = [
    body('vehicle_id')
        .isInt({ min: 1 }).withMessage('vehicle_id debe ser un entero positivo.'),
    body('motorista')
        .trim()
        .notEmpty().withMessage('El motorista es requerido.')
        .isLength({ max: 150 }).withMessage('El motorista no puede superar 150 caracteres.')
        .matches(/^[a-zA-Z\s'\-]+$/).withMessage('El nombre del motorista solo puede contener letras, espacios, guiones y apóstrofes, sin números ni caracteres especiales.'),
    body('tipo')
        .isIn(['entrada', 'salida']).withMessage('El tipo debe ser "entrada" o "salida".'),
    body('fecha')
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('La fecha debe tener formato YYYY-MM-DD.'),
    body('hora')
        .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('La hora debe tener formato HH:MM o HH:MM:SS.'),
    body('kilometraje')
        .isInt({ min: 0 }).withMessage('El kilometraje debe ser un número entero positivo.'),
];

const entryUpdateRules = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
    ...entryCreateRules,
];

const entryIdRule = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
];

const entryQueryRules = [
    query('fecha').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('Fecha inválida.'),
    query('vehicle_id').optional().isInt({ min: 1 }).withMessage('vehicle_id inválido.'),
    query('motorista').optional().isString(),
];

module.exports = { entryCreateRules, entryUpdateRules, entryIdRule, entryQueryRules };
