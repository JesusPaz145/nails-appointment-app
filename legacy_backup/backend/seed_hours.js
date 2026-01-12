const pool = require('./config/db');

const seedHours = async () => {
    try {
        console.log('Checking existing hours...');
        const res = await pool.query('SELECT count(*) FROM horarios_disponibles');

        if (parseInt(res.rows[0].count) > 0) {
            console.log('Table already has data. Skipping seed.');
            process.exit(0);
        }

        console.log('Seeding default hours...');
        const query = `
            INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo) VALUES 
            (1, '18:00:00', '22:00:00', true), -- Lunes
            (2, '18:00:00', '22:00:00', true), -- Martes
            (3, '18:00:00', '22:00:00', true), -- Miercoles
            (4, '18:00:00', '22:00:00', true), -- Jueves
            (5, '18:00:00', '22:00:00', true), -- Viernes
            (6, '18:00:00', '22:00:00', true), -- Sabado
            (0, '11:00:00', '18:00:00', true); -- Domingo
        `;

        await pool.query(query);
        console.log('Successfully seeded hours!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedHours();
