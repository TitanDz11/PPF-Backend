'use strict';

const { Router } = require('express');
const controller = require('./vehicle.controller');
const { vehicleCreateRules, vehicleUpdateRules, vehicleIdRule } = require('./vehicle.validator');
const { validate } = require('../../middleware/validate');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', vehicleIdRule, validate, controller.getOne);
router.post('/', vehicleCreateRules, validate, controller.create);
router.put('/:id', vehicleUpdateRules, validate, controller.update);
router.delete('/:id', vehicleIdRule, validate, controller.remove);

module.exports = router;
