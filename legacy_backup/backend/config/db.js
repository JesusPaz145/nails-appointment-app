const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nailsbyanais',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
};

console.log('--- DB CONFIG CHECK ---');
console.log('User:', dbConfig.user);
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('DB Name:', dbConfig.database);
console.log('Password Length:', dbConfig.password.length);
console.log('Password First/Last:', dbConfig.password.charAt(0), '...', dbConfig.password.slice(-1));
console.log('-----------------------');

const pool = new Pool(dbConfig);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
