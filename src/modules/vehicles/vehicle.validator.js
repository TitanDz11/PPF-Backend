'use strict';

const { body, param, query } = require('express-validator');

const vehicleCreateRules = [
    body('marca')
        .trim()
        .notEmpty().withMessage('La marca es requerida.')
        .isLength({ max: 100 }).withMessage('La marca no puede superar 100 caracteres.'),
    body('modelo')
        .trim()
        .notEmpty().withMessage('El modelo es requerido.')
        .isLength({ max: 100 }).withMessage('El modelo no puede superar 100 caracteres.'),
    body('placa')
        .trim()
        .notEmpty().withMessage('La placa es requerida.')
        .isLength({ max: 20 }).withMessage('La placa no puede superar 20 caracteres.')
        .matches(/^[A-Za-z0-9\-]+$/).withMessage('La placa solo puede contener letras, números y guiones.'),
];

const vehicleUpdateRules = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
    ...vehicleCreateRules,
];

const vehicleIdRule = [
    param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
];

const vehicleQueryRules = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { vehicleCreateRules, vehicleUpdateRules, vehicleIdRule, vehicleQueryRules };
