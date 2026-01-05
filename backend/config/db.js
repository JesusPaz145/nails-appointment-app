const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || '192.168.4.175',
    database: process.env.DB_NAME || 'nailsbyanais',
    password: process.env.DB_PASSWORD || 'Yisus78_Secure!db26',
    port: process.env.DB_PORT || 5433,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
