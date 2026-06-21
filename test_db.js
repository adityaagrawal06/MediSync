const db = require('./backend/src/config/db');

async function test() {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('Database connected successfully:', rows);
    
    const [tables] = await db.execute('SHOW TABLES');
    console.log('Tables:', tables);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    process.exit(0);
  }
}

test();
