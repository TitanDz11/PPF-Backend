'use strict';

const entryService = require('./entry.service');

async function getAll(req, res, next) {
    try {
        const { fecha, vehicle_id, motorista } = req.query;
        const entries = await entryService.findAll({ fecha, vehicle_id, motorista });
        res.json({ data: entries });
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const entry = await entryService.findById(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.json({ data: entry });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const entry = await entryService.create(req.body);
        res.status(201).json({ data: entry });
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'El vehículo especificado no existe.' });
        }
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const entry = await entryService.update(req.params.id, req.body);
        if (!entry) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.json({ data: entry });
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: 'El vehículo especificado no existe.' });
        }
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const deleted = await entryService.remove(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.json({ message: 'Registro eliminado correctamente.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getOne, create, update, remove };
