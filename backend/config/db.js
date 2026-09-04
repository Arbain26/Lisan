const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

let pool;

if (databaseUrl) {
  // ==============================================================================
  // SUPABASE / POSTGRESQL MODE
  // ==============================================================================
  const { Pool, types } = require('pg');

  // Convert int8 (COUNT(*), etc.) and numeric to JS numbers
  types.setTypeParser(20, (val) => parseInt(val, 10));
  types.setTypeParser(1700, (val) => parseFloat(val));

  const pgPool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected Supabase PostgreSQL error on idle client:', err);
  });

  // Query conversion helper: MySQL syntax (?, insertId) -> PostgreSQL ($1, RETURNING)
  const executePgQuery = async (executor, sql, params = []) => {
    let paramIndex = 1;
    let convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    const trimmed = convertedSql.trim();
    const isInsert = /^insert\s+into/i.test(trimmed);

    // Auto-append RETURNING id for INSERT queries if not already present
    if (isInsert && !/returning/i.test(trimmed)) {
      convertedSql += ' RETURNING id';
    }

    const res = await executor.query(convertedSql, params);

    // Attach MySQL-like properties to rows array for 100% controller compatibility
    const rows = res.rows || [];
    rows.affectedRows = res.rowCount;
    if (isInsert) {
      rows.insertId = rows[0]?.id || null;
    }

    return [rows, res.fields];
  };

  pool = {
    isSupabase: true,
    query: async (sql, params) => {
      return executePgQuery(pgPool, sql, params);
    },
    getConnection: async () => {
      const client = await pgPool.connect();
      return {
        query: async (sql, params) => executePgQuery(client, sql, params),
        beginTransaction: async () => client.query('BEGIN'),
        commit: async () => client.query('COMMIT'),
        rollback: async () => client.query('ROLLBACK'),
        release: () => client.release()
      };
    },
    end: () => pgPool.end()
  };

  console.log('Database configured in SUPABASE (PostgreSQL) mode.');
} else {
  // ==============================================================================
  // MYSQL FALLBACK MODE (Local Development)
  // ==============================================================================
  const mysql = require('mysql2/promise');

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_lisan',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pool.isSupabase = false;
  console.log('Database configured in MYSQL fallback mode.');
}

module.exports = pool;
