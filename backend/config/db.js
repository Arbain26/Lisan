const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

let databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

// Fallback to Supabase connection pooler if running on Vercel or cloud and DATABASE_URL is not set in env
if (!databaseUrl && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
  databaseUrl = 'postgresql://postgres.jmkmjmbglnnafclfpbjp:admin%40lisan1234@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
}

// Auto-fix IPv6 direct connection to IPv4 Connection Pooler (prevents getaddrinfo ENOTFOUND)
if (databaseUrl) {
  // Normalize project ID typo (L vs I)
  databaseUrl = databaseUrl.replace('jmkmjmbginnafclfpbjp', 'jmkmjmbglnnafclfpbjp');
  
  if (databaseUrl.includes('db.jmkmjmbglnnafclfpbjp.supabase.co')) {
    databaseUrl = databaseUrl.replace('db.jmkmjmbglnnafclfpbjp.supabase.co', 'aws-0-ap-northeast-1.pooler.supabase.com');
    if (databaseUrl.includes(':5432')) {
      databaseUrl = databaseUrl.replace(':5432', ':6543');
    }
  }

  // Ensure correct username format postgres.jmkmjmbglnnafclfpbjp
  if (databaseUrl.includes('aws-0-ap-northeast-1.pooler.supabase.com')) {
    if (databaseUrl.includes('://admin@lisan.id:') || databaseUrl.includes('://postgres:')) {
      databaseUrl = databaseUrl.replace(/:\/\/[^:]+:/, '://postgres.jmkmjmbglnnafclfpbjp:');
    }
    // Remove accidental brackets around password
    databaseUrl = databaseUrl.replace(/:\/\/([^:]+):\[([^\]]+)\]@/, '://$1:$2@');
  }
}

let pool;

if (databaseUrl && !databaseUrl.includes('[PASSWORD_ANDA]') && !databaseUrl.includes('[YOUR-PASSWORD]')) {
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

  // Query conversion helper: MySQL syntax (?, insertId, VALUES ?, IN (?)) -> PostgreSQL ($1, RETURNING)
  const executePgQuery = async (executor, sql, params = []) => {
    let paramIndex = 1;
    let parts = sql.split('?');
    let convertedSql = '';
    let finalParams = [];

    for (let i = 0; i < parts.length - 1; i++) {
      convertedSql += parts[i];
      const p = params[i];
      if (Array.isArray(p) && p.length > 0 && Array.isArray(p[0])) {
        // Bulk insert: [[a, b], [c, d]] -> ($1, $2), ($3, $4)
        const rowSql = p.map(row => {
          const cols = row.map(val => {
            finalParams.push(val);
            return `$${paramIndex++}`;
          });
          return `(${cols.join(', ')})`;
        }).join(', ');
        convertedSql += rowSql;
      } else if (Array.isArray(p)) {
        // IN (?) clause: [1, 2, 3] -> ($1, $2, $3)
        if (p.length === 0) {
          convertedSql += 'NULL';
        } else {
          const inSql = p.map(val => {
            finalParams.push(val);
            return `$${paramIndex++}`;
          }).join(', ');
          convertedSql += inSql;
        }
      } else {
        finalParams.push(p);
        convertedSql += `$${paramIndex++}`;
      }
    }
    convertedSql += parts[parts.length - 1];

    // Convert backticks `table` to standard identifier "table"
    convertedSql = convertedSql.replace(/`([^`]+)`/g, '"$1"');

    // Replace literal double quotes around text values that cause "column does not exist"
    convertedSql = convertedSql.replace(/"(Belum Mulai|Terlaksana|Tidak Terlaksana)"/g, "'$1'");

    const trimmed = convertedSql.trim();
    const isInsert = /^insert\s+into/i.test(trimmed);

    // Auto-append RETURNING id for INSERT queries if not already present
    if (isInsert && !/returning/i.test(trimmed)) {
      convertedSql += ' RETURNING id';
    }

    const res = await executor.query(convertedSql, finalParams);

    // Attach MySQL-like properties to rows array for 100% controller compatibility
    const rows = res.rows || [];
    rows.affectedRows = res.rowCount;
    if (isInsert) {
      rows.insertId = rows[0]?.id || null;
    }

    return [rows, res.fields];
  };

  // Ensure Supabase schema compatibility (e.g. table kader columns)
  const ensureSupabaseSchema = async () => {
    try {
      await pgPool.query(`
        ALTER TABLE IF EXISTS kader ADD COLUMN IF NOT EXISTS kampus VARCHAR(150);
        ALTER TABLE IF EXISTS kader ADD COLUMN IF NOT EXISTS alamat VARCHAR(255);
        ALTER TABLE IF EXISTS kader ADD COLUMN IF NOT EXISTS jenjang_kaderisasi VARCHAR(100);
        ALTER TABLE IF EXISTS kader ADD COLUMN IF NOT EXISTS semester VARCHAR(20);
        ALTER TABLE IF EXISTS kader ADD COLUMN IF NOT EXISTS status VARCHAR(50);
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kader' AND column_name='institusi') THEN
            ALTER TABLE kader ALTER COLUMN institusi DROP NOT NULL;
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kader' AND column_name='tahun') THEN
            ALTER TABLE kader ALTER COLUMN tahun DROP NOT NULL;
          END IF;
        END $$;
      `);
      console.log('Supabase schema compatibility verified.');
    } catch (e) {
      console.warn('Note on Supabase schema verification:', e.message);
    }
  };
  ensureSupabaseSchema();

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
