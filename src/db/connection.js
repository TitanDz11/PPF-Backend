'use strict';

const mysql = require('mysql2/promise');
const config = require('../config/env');

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

let pool = null;

/**
 * Creates the MySQL connection pool (singleton).
 * @returns {mysql.Pool}
 */
function getPool() {
    if (!pool) {
        pool = mysql.createPool(config.db);
    }
    return pool;
}

/**
 * Attempts to acquire a connection from the pool with exponential-backoff retry.
 * Prevents race conditions by resolving only after the first successful ping.
 * @param {number} attempt
 * @returns {Promise<void>}
 */
async function connectWithRetry(attempt = 1) {
    try {
        const connection = await getPool().getConnection();
        await connection.ping();
        connection.release();
        console.log(`[DB] Connected to MySQL (attempt ${attempt})`);
    } catch (err) {
        if (attempt >= MAX_RETRIES) {
            throw new Error(`[DB] Could not connect after ${MAX_RETRIES} attempts: ${err.message}`);
        }
        const delay = RETRY_DELAY_MS * Math.min(attempt, 5); // cap backoff
        console.warn(`[DB] Connection attempt ${attempt} failed. Retrying in ${delay}ms…`);
        await sleep(delay);
        return connectWithRetry(attempt + 1);
    }
}

/**
 * Gracefully closes the pool (called on shutdown).
 * @returns {Promise<void>}
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('[DB] Connection pool closed.');
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getPool, connectWithRetry, closePool };
