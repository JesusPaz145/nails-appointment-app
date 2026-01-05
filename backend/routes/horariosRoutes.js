const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/horarios
// @desc    Get all business hours
// @access  Public
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM horarios_disponibles ORDER BY dia_semana ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/horarios/:id
// @desc    Update business hours
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
    const { hora_inicio, hora_fin, activo } = req.body;
    const { id } = req.params;

    if (req.user.lvl !== 1) {
        // Admin only (lvl 1)
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    try {
        const result = await pool.query(
            'UPDATE horarios_disponibles SET hora_inicio = $1, hora_fin = $2, activo = $3 WHERE id = $4 RETURNING *',
            [hora_inicio, hora_fin, activo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Horario not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
