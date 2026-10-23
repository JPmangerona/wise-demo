const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.zkevjpwwmeucubwqkmyk:x%26JHLmy%24aLg3.J%25@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
});
client.connect().then(() => {
  return client.query('SELECT email, password_hash FROM users;');
}).then(res => {
  console.log(res.rows);
  client.end();
}).catch(err => {
  console.error(err);
  client.end();
});
