'use strict';

const { Router } = require('express');
const controller = require('./vehicle.controller');
const { vehicleCreateRules, vehicleUpdateRules, vehicleIdRule } = require('./vehicle.validator');
const { validate } = require('../../middleware/validate');
const { mutationLimiter, deleteLimiter } = require('../../middleware/rateLimiter');
const { auditLogger } = require('../../middleware/auditLogger');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', vehicleIdRule, validate, controller.getOne);
router.post('/', mutationLimiter, auditLogger, vehicleCreateRules, validate, controller.create);
router.put('/:id', mutationLimiter, auditLogger, vehicleUpdateRules, validate, controller.update);
router.delete('/:id', deleteLimiter, auditLogger, vehicleIdRule, validate, controller.remove);

module.exports = router;
