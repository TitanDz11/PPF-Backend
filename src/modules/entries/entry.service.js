'use strict';

const { getPool } = require('../../db/connection');

/**
 * Build a dynamic WHERE clause from optional query filters.
 * @param {{ fecha?, vehicle_id?, motorista? }} filters
 * @returns {{ clause: string, values: any[] }}
 */
function buildFilters({ fecha, vehicle_id, motorista }) {
    const conditions = [];
    const values = [];

    if (fecha) {
        conditions.push('e.fecha = ?');
        values.push(fecha);
    }
    if (vehicle_id) {
        conditions.push('e.vehicle_id = ?');
        values.push(Number(vehicle_id));
    }
    if (motorista) {
        conditions.push('e.motorista LIKE ?');
        values.push(`%${motorista}%`);
    }

    const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, values };
}

async function findAll(filters = {}) {
    const { clause, values } = buildFilters(filters);
    const [rows] = await getPool().query(
        `SELECT e.id, e.vehicle_id, v.marca, v.modelo, v.placa,
            e.motorista, e.tipo, e.fecha, e.hora, e.kilometraje,
            e.created_at, e.updated_at
     FROM entries e
     JOIN vehicles v ON v.id = e.vehicle_id
     ${clause}
     ORDER BY e.fecha DESC, e.hora DESC`,
        values
    );
    return rows;
}

async function findById(id) {
    const [rows] = await getPool().query(
        `SELECT e.id, e.vehicle_id, v.marca, v.modelo, v.placa,
            e.motorista, e.tipo, e.fecha, e.hora, e.kilometraje,
            e.created_at, e.updated_at
     FROM entries e
     JOIN vehicles v ON v.id = e.vehicle_id
     WHERE e.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function create({ vehicle_id, motorista, tipo, fecha, hora, kilometraje }) {
    const [result] = await getPool().query(
        'INSERT INTO entries (vehicle_id, motorista, tipo, fecha, hora, kilometraje) VALUES (?, ?, ?, ?, ?, ?)',
        [vehicle_id, motorista, tipo, fecha, hora, kilometraje]
    );
    return findById(result.insertId);
}

async function update(id, { vehicle_id, motorista, tipo, fecha, hora, kilometraje }) {
    await getPool().query(
        'UPDATE entries SET vehicle_id = ?, motorista = ?, tipo = ?, fecha = ?, hora = ?, kilometraje = ? WHERE id = ?',
        [vehicle_id, motorista, tipo, fecha, hora, kilometraje, id]
    );
    return findById(id);
}

async function remove(id) {
    const [result] = await getPool().query('DELETE FROM entries WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
