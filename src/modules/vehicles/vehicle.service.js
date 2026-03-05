'use strict';

const { getPool } = require('../../db/connection');

/**
 * Vehicle Service – encapsulates all SQL for vehicles.
 * Follows SRP: only vehicle data persistence here.
 */

async function findAll() {
    const [rows] = await getPool().query(
        'SELECT id, marca, modelo, placa, created_at, updated_at FROM vehicles ORDER BY id DESC'
    );
    return rows;
}

async function findById(id) {
    const [rows] = await getPool().query(
        'SELECT id, marca, modelo, placa, created_at, updated_at FROM vehicles WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function create({ marca, modelo, placa }) {
    const [result] = await getPool().query(
        'INSERT INTO vehicles (marca, modelo, placa) VALUES (?, ?, ?)',
        [marca, modelo, placa]
    );
    return findById(result.insertId);
}

async function update(id, { marca, modelo, placa }) {
    await getPool().query(
        'UPDATE vehicles SET marca = ?, modelo = ?, placa = ? WHERE id = ?',
        [marca, modelo, placa, id]
    );
    return findById(id);
}

async function remove(id) {
    const [result] = await getPool().query('DELETE FROM vehicles WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };
