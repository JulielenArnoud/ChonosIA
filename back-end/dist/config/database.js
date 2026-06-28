"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
exports.initializeDatabase = initializeDatabase;
const pg_1 = require("pg");
const env_1 = require("./env");
exports.pool = new pg_1.Pool({
    host: env_1.env.dbHost,
    port: env_1.env.dbPort,
    database: env_1.env.dbName,
    user: env_1.env.dbUser,
    password: env_1.env.dbPassword,
});
let initialized = false;
async function initializeDatabase() {
    if (initialized)
        return;
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      s3_key VARCHAR(500) NOT NULL,
      s3_url VARCHAR(500),
      file_size INTEGER,
      file_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    initialized = true;
}
const query = async (text, params) => {
    const result = await exports.pool.query(text, params);
    return result;
};
exports.query = query;
