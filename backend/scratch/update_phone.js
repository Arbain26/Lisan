const pool = require('../config/db');

async function run() {
  console.log('Updating phone number to +62 819-3317-2687 in database...');
  await pool.query("UPDATE pengaturan SET telepon = '+62 819-3317-2687' WHERE id = 1");
  console.log('Update completed!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
