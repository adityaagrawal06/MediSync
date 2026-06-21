const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    console.log('Testing bcrypt...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Bcrypt worked!');

    console.log('Testing insert...');
    const [result] = await db.execute(
      `INSERT INTO user (email, hashed_password, full_name, phone, date_of_birth) 
       VALUES (?, ?, ?, ?, ?)`,
      ['test2@example.com', hashedPassword, 'Test User', '1234567890', null]
    );
    console.log('Insert worked!', result);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

test();
