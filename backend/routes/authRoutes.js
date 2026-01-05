const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await pool.query('SELECT id, name, "user", usr_lvl, email, phone FROM usuarios_sistema WHERE id = $1', [req.user.id]);
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, user, pwd, email, phone } = req.body;

    try {
        const userExists = await pool.query('SELECT * FROM usuarios_sistema WHERE "user" = $1', [user]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(pwd, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios_sistema (name, "user", pwd, email, phone, usr_lvl) VALUES ($1, $2, $3, $4, $5, 2) RETURNING *',
            [name, user, passwordHash, email, phone]
        );

        const payload = {
            user: {
                id: newUser.rows[0].id,
                lvl: newUser.rows[0].usr_lvl
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretkeynailsbyanais123!',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 }); // 5 days
                res.json({ token, user: newUser.rows[0] });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { user, pwd } = req.body;

    try {
        const foundUser = await pool.query('SELECT * FROM usuarios_sistema WHERE "user" = $1', [user]);

        if (foundUser.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(pwd, foundUser.rows[0].pwd);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: foundUser.rows[0].id,
                lvl: foundUser.rows[0].usr_lvl
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretkeynailsbyanais123!',
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 });
                res.json({ token, user: foundUser.rows[0] });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ msg: 'Logged out successfully' });
});

module.exports = router;
