const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const auth = require('../middleware/auth');

// @route   GET api/servicios
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM servicios ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/servicios
// @desc    Add new service
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
    // Check if admin (level 1)
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    const { nombre_servicio, precio, duracion_minutos, descripcion } = req.body;

    try {
        const newService = await pool.query(
            'INSERT INTO servicios (nombre_servicio, precio, duracion_minutos, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_servicio, precio, duracion_minutos, descripcion]
        );
        res.json(newService.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/servicios/:id
// @desc    Update service
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    const { id } = req.params;
    const { nombre_servicio, precio, duracion_minutos, descripcion } = req.body;

    try {
        const updatedService = await pool.query(
            'UPDATE servicios SET nombre_servicio = $1, precio = $2, duracion_minutos = $3, descripcion = $4 WHERE id = $5 RETURNING *',
            [nombre_servicio, precio, duracion_minutos, descripcion, id]
        );

        if (updatedService.rows.length === 0) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        res.json(updatedService.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/servicios/:id
// @desc    Delete service
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    const { id } = req.params;

    try {
        await pool.query('DELETE FROM servicios WHERE id = $1', [id]);
        res.json({ msg: 'Service deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
