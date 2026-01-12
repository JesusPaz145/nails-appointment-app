const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/citas
// @desc    Get all appointments (filter by user or all if admin)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query;
        if (req.user.lvl === 1) { // Admin (1) sees all
            query = 'SELECT c.*, s.nombre_servicio, u.name as user_name FROM citas c LEFT JOIN servicios s ON c.servicio_id = s.id LEFT JOIN usuarios_sistema u ON c.usuario_id = u.id ORDER BY fecha_cita DESC, hora_inicio DESC';
            // Simple query for now
            const result = await pool.query(query);
            return res.json(result.rows);
        } else {
            // User sees own
            query = 'SELECT c.*, s.nombre_servicio FROM citas c LEFT JOIN servicios s ON c.servicio_id = s.id WHERE usuario_id = $1 ORDER BY fecha_cita DESC, hora_inicio DESC';
            const result = await pool.query(query, [req.user.id]);
            return res.json(result.rows);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/citas
// @desc    Create a new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
    const { servicio_id, fecha_cita, hora_inicio, cliente_nombre, cliente_telefono, cliente_email, notas } = req.body;

    try {
        // 1. Get Service Duration
        const serviceRes = await pool.query('SELECT duracion_minutos FROM servicios WHERE id = $1', [servicio_id]);
        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Servicio not found' });
        }
        const duration = serviceRes.rows[0].duracion_minutos;

        // 2. Calculate End Time
        const startDate = new Date(`${fecha_cita}T${hora_inicio}`);
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const hora_fin = endDate.toTimeString().split(' ')[0]; // HH:MM:SS

        // 3. Check Availability (Collision detection)
        // Check if any existing appointment overlaps with the requested time range
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        const checkQuery = `
            SELECT * FROM citas 
            WHERE fecha_cita = $1 
            AND (
                (hora_inicio < $2 AND hora_fin > $3) OR -- Overlaps logic
                (hora_inicio >= $3 AND hora_inicio < $2) OR -- Starts during
                (hora_fin > $3 AND hora_fin <= $2) -- Ends during
            )
            AND estado != 'cancelada'
        `;
        // Simplified overlap: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
        // SQL Time comparison works directly
        const overlapCheck = await pool.query(
            "SELECT * FROM citas WHERE fecha_cita = $1 AND estado != 'cancelada' AND (hora_inicio < $3 AND hora_fin > $2)",
            [fecha_cita, hora_inicio, hora_fin]
        );

        if (overlapCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'Slot not available, please choose another time.' });
        }

        // 4. Create Appointment
        const newCita = await pool.query(
            'INSERT INTO citas (cliente_nombre, cliente_telefono, cliente_email, servicio_id, fecha_cita, hora_inicio, hora_fin, notas, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [cliente_nombre, cliente_telefono, cliente_email, servicio_id, fecha_cita, hora_inicio, hora_fin, notas, req.user.id]
        );

        res.json(newCita.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/citas/disponibilidad
// @desc    Get available slots for a date
// @access  Public (or Private? User said "puedan ver disponibilidad")
router.get('/disponibilidad', async (req, res) => {
    const { fecha, servicio_id } = req.query;

    if (!fecha || !servicio_id) {
        return res.status(400).json({ msg: 'Fecha and servicio_id required' });
    }

    try {
        // 1. Get Day of Week
        const dateObj = new Date(fecha);
        // getDay() returns 0 for Sunday, 1 for Monday... matching our DB convention (check schema if 0=Sunday)
        // Note: '2023-01-01' (string) to Date might depend on timezone.
        // Safest is to treat input YYYY-MM-DD as local date parts.
        // But for getDay(), we need to be careful.
        // Let's assume input is YYYY-MM-DD.
        const dayOfWeek = dateObj.getDay(); // 0-6

        // 2. Get Business Hours for that day
        const horarioRes = await pool.query('SELECT * FROM horarios_disponibles WHERE dia_semana = $1 AND activo = true', [dayOfWeek]);

        if (horarioRes.rows.length === 0) {
            return res.json([]); // Closed that day
        }

        const openTime = horarioRes.rows[0].hora_inicio; // HH:MM:SS
        const closeTime = horarioRes.rows[0].hora_fin;

        // 3. Get Service Duration
        const serviceRes = await pool.query('SELECT duracion_minutos FROM servicios WHERE id = $1', [servicio_id]);
        if (serviceRes.rows.length === 0) return res.status(404).json({ msg: 'Service not found' });
        const duration = serviceRes.rows[0].duracion_minutos;

        // 4. Get Existing Appointments
        const citasRes = await pool.query(
            "SELECT hora_inicio, hora_fin FROM citas WHERE fecha_cita = $1 AND estado != 'cancelada'",
            [fecha]
        );
        const existingCitas = citasRes.rows;

        // 5. Generate Slots
        // We need to generate 30-min slots (or whatever interval) but check if the *service duration* fits.
        // User said "cada 30 minutos, pero si alguien escoge un servicio, este ocupara varios slots".

        let slots = [];
        // Helper to convert HH:MM:SS to minutes from midnight
        const toMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };
        const fromMinutes = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
        };

        const startMins = toMinutes(openTime);
        const endMins = toMinutes(closeTime);
        const step = 30; // 30 minutes interval

        for (let time = startMins; time + duration <= endMins; time += step) {
            const slotStart = time;
            const slotEnd = time + duration;

            // Check collision
            let isFree = true;
            for (let cita of existingCitas) {
                const citStart = toMinutes(cita.hora_inicio);
                const citEnd = toMinutes(cita.hora_fin);

                // Overlap: (SlotStart < CitEnd) AND (SlotEnd > CitStart)
                if (slotStart < citEnd && slotEnd > citStart) {
                    isFree = false;
                    break;
                }
            }

            if (isFree) {
                slots.push(fromMinutes(slotStart));
            }
        }

        res.json(slots);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/citas/:id
// @desc    Update appointment status (approve/reject/complete)
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
    const { estado } = req.body;
    const { id } = req.params;

    // Check if admin
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Not authorized' });
    }

    // Validate status
    const validStatuses = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (!validStatuses.includes(estado)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const updateQuery = 'UPDATE citas SET estado = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(updateQuery, [estado, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
