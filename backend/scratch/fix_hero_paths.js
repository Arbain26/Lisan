const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const heroDir = path.join(__dirname, '../uploads/hero');
  const miscDir = path.join(__dirname, '../uploads/misc');

  // 1. Create hero directory if it doesn't exist
  if (!fs.existsSync(heroDir)) {
    console.log('Creating hero uploads directory...');
    fs.mkdirSync(heroDir, { recursive: true });
  }

  // 2. Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_lisan'
  });

  // 3. Fetch current slides
  const [rows] = await connection.query('SELECT * FROM hero_slides');
  console.log('Current slides in database:', rows);

  for (const row of rows) {
    if (row.image_url.startsWith('/uploads/') && !row.image_url.startsWith('/uploads/hero/')) {
      const filename = path.basename(row.image_url);
      const oldPath = path.join(miscDir, filename);
      const newPath = path.join(heroDir, filename);

      // Check if file exists in misc/ and move it
      if (fs.existsSync(oldPath)) {
        console.log(`Moving ${filename} from misc/ to hero/...`);
        fs.renameSync(oldPath, newPath);
      } else {
        console.log(`Warning: File ${filename} not found in misc/ (might already be moved).`);
      }

      // Update database URL
      const newUrl = `/uploads/hero/${filename}`;
      console.log(`Updating DB url for slide id ${row.id} to ${newUrl}...`);
      await connection.query('UPDATE hero_slides SET image_url = ? WHERE id = ?', [newUrl, row.id]);
    }
  }

  console.log('Hero paths migration completed successfully!');
  await connection.end();
  process.exit(0);
}

run().catch(err => {
  console.error('Error migrating hero paths:', err);
  process.exit(1);
});
