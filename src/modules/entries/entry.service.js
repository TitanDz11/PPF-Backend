'use strict';

const { getPool } = require('../../db/connection');

/**
 * Build a dynamic WHERE clause from optional query filters.
 * Includes strict input validation and sanitization to prevent SQL injection.
 * @param {{ fecha?, vehicle_id?, motorista? }} filters
 * @returns {{ clause: string, values: any[] }}
 */
function buildFilters({ fecha, vehicle_id, motorista }) {
    const conditions = [];
    const values = [];

    // Strict date format validation (YYYY-MM-DD)
    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        conditions.push('e.fecha = ?');
        values.push(fecha);
    }
    
    // Ensure vehicle_id is numeric and positive
    if (vehicle_id) {
        const parsedId = parseInt(vehicle_id, 10);
        if (!isNaN(parsedId) && parsedId > 0) {
            conditions.push('e.vehicle_id = ?');
            values.push(parsedId);
        }
    }
    
    // Sanitize motorista - remove SQL special characters and limit length
    if (motorista && typeof motorista === 'string') {
        // Remove potentially dangerous characters: quotes, semicolons, backslashes
        const sanitized = motorista
            .replace(/['";\\]/g, '')
            .trim()
            .substring(0, 150); // Enforce max length
        
        if (sanitized) {
            conditions.push('e.motorista LIKE ?');
            values.push(`%${sanitized}%`);
        }
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
