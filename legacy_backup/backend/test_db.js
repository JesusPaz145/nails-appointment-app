const pool = require('./config/db');

async function testConnection() {
    try {
        console.log('Testing connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        console.log('Checking table usuarios_sistema...');
        const table = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'usuarios_sistema'");
        console.log('Table exists:', table.rows.length > 0);

        if (table.rows.length > 0) {
            console.log('Checking columns...');
            const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios_sistema'");
            console.log('Columns:', columns.rows.map(r => r.column_name));
        }

        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
