import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// For production environments, we'll require an SSL connection to the database.
// This encrypts data in transit, preventing eavesdropping.
// For local development, SSL is disabled for simplicity.
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { ssl: { rejectUnauthorized: false } } 
  : {};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...sslConfig,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

/**
 * Executes a SQL query against the database.
 * 
 * This function uses parameterized queries, which is the primary and most effective
 * defense against SQL injection attacks. The `pg` library automatically and safely
 * substitutes parameters, ensuring that user input cannot be executed as SQL code.
 * 
 * @param {string} text - The SQL query string, with placeholders like $1, $2, etc.
 * @param {Array} params - An array of values to be safely substituted into the query.
 * @returns {Promise<pg.QueryResult>} A promise that resolves with the query result.
 */
export const query = (text, params) => pool.query(text, params);
