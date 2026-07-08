const pool = require('./config/db');

async function setupHeroTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS \`hero_slides\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`image_url\` varchar(255) NOT NULL,
        \`title\` varchar(150) NOT NULL,
        \`highlight\` varchar(100) NOT NULL,
        \`sub\` text NOT NULL,
        \`created_at\` timestamp DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(query);
    console.log('Table \`hero_slides\` created successfully.');

    // Insert default data if empty
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM hero_slides');
    if (count === 0) {
      await pool.query(`
        INSERT INTO hero_slides (image_url, title, highlight, sub) VALUES 
        ('https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=1920&q=85', 'Lingkar Mahasiswa Islam', 'untuk Perubahan', 'Membangun generasi intelektual, progresif, dan Islami untuk masa depan Indonesia yang lebih baik.'),
        ('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=85', 'Bergerak Bersama,', 'Membawa Perubahan', 'Organisasi mahasiswa Islam yang berdedikasi untuk kemajuan sosial, intelektual, dan spiritual.'),
        ('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.')
      `);
      console.log('Inserted default hero slides.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

setupHeroTable();
