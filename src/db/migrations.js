'use strict';

const mysql = require('mysql2/promise');
const config = require('../config/env');

/**
 * Creates the database if it doesn't exist, then runs table migrations.
 * Uses a temporary rootless connection without selecting a DB,
 * so this is safe even on first boot.
 */
async function runMigrations() {
    // Connect without a specific database to create it if needed
    const tempPool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        connectionLimit: 1,
    });

    const conn = await tempPool.getConnection();

    try {
        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        await conn.query(`USE \`${config.db.database}\``);

        await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id          INT          NOT NULL AUTO_INCREMENT,
        marca       VARCHAR(100) NOT NULL,
        modelo      VARCHAR(100) NOT NULL,
        placa       VARCHAR(20)  NOT NULL,
        created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_placa (placa)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        await conn.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id           INT                     NOT NULL AUTO_INCREMENT,
        vehicle_id   INT                     NOT NULL,
        motorista    VARCHAR(150)            NOT NULL,
        tipo         ENUM('entrada','salida') NOT NULL,
        fecha        DATE                    NOT NULL,
        hora         TIME                    NOT NULL,
        kilometraje  INT UNSIGNED            NOT NULL,
        created_at   TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_entry_vehicle FOREIGN KEY (vehicle_id)
          REFERENCES vehicles (id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        INDEX idx_fecha      (fecha),
        INDEX idx_motorista  (motorista),
        INDEX idx_vehicle_id (vehicle_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

        console.log('[DB] Migrations complete.');
    } finally {
        conn.release();
        await tempPool.end();
    }
}

module.exports = { runMigrations };
