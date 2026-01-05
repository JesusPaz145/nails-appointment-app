const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/usuarios
// @desc    Get all users
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    try {
        const result = await pool.query('SELECT id, name, "user", email, phone, usr_lvl, creation_date FROM usuarios_sistema ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/usuarios/:id/level
// @desc    Update user level (Client <-> Admin)
// @access  Private (Admin)
router.put('/:id/level', auth, async (req, res) => {
    if (req.user.lvl !== 1) {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }

    const { id } = req.params;
    const { usr_lvl } = req.body; // Expecting integer (1=client, 2=admin)

    try {
        const updatedUser = await pool.query(
            'UPDATE usuarios_sistema SET usr_lvl = $1 WHERE id = $2 RETURNING id, name, usr_lvl',
            [usr_lvl, id]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
