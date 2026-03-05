'use strict';

const { Router } = require('express');
const controller = require('./entry.controller');
const { entryCreateRules, entryUpdateRules, entryIdRule, entryQueryRules } = require('./entry.validator');
const { validate } = require('../../middleware/validate');

const router = Router();

router.get('/', entryQueryRules, validate, controller.getAll);
router.get('/:id', entryIdRule, validate, controller.getOne);
router.post('/', entryCreateRules, validate, controller.create);
router.put('/:id', entryUpdateRules, validate, controller.update);
router.delete('/:id', entryIdRule, validate, controller.remove);

module.exports = router;
