const { Client } = require('pg');
require('dotenv').config();

async function checkMovements() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM movements;');
    console.log(`Found ${res.rows.length} movements.`);
    if (res.rows.length > 0) {
      console.log(res.rows);
    }
  } catch (err) {
    console.error('Error connecting to database:', err);
  } finally {
    await client.end();
  }
}

checkMovements();
