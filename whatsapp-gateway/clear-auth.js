require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function clearAuth() {
    try {
        console.log('Clearing auth state...');
        await pool.query('TRUNCATE TABLE baileys_auth');
        console.log('Auth state cleared successfully!');
    } catch (e) {
        console.error('Error clearing auth:', e);
    } finally {
        await pool.end();
    }
}
clearAuth();
