'use strict';

const { Router } = require('express');
const controller = require('./entry.controller');
const { entryCreateRules, entryUpdateRules, entryIdRule, entryQueryRules } = require('./entry.validator');
const { validate } = require('../../middleware/validate');
const { mutationLimiter, deleteLimiter } = require('../../middleware/rateLimiter');
const { auditLogger } = require('../../middleware/auditLogger');

const router = Router();

router.get('/', entryQueryRules, validate, controller.getAll);
router.get('/:id', entryIdRule, validate, controller.getOne);
router.post('/', mutationLimiter, auditLogger, entryCreateRules, validate, controller.create);
router.put('/:id', mutationLimiter, auditLogger, entryUpdateRules, validate, controller.update);
router.delete('/:id', deleteLimiter, auditLogger, entryIdRule, validate, controller.remove);

module.exports = router;
