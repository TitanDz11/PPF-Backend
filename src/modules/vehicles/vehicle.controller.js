'use strict';

const vehicleService = require('./vehicle.service');

async function getAll(req, res, next) {
    try {
        const vehicles = await vehicleService.findAll();
        res.json({ data: vehicles });
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const vehicle = await vehicleService.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado.' });
        res.json({ data: vehicle });
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const vehicle = await vehicleService.create(req.body);
        res.status(201).json({ data: vehicle });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La placa ya está registrada.' });
        }
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const vehicle = await vehicleService.update(req.params.id, req.body);
        if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado.' });
        res.json({ data: vehicle });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La placa ya está registrada.' });
        }
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const deleted = await vehicleService.remove(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Vehículo no encontrado.' });
        res.json({ message: 'Vehículo eliminado correctamente.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAll, getOne, create, update, remove };
