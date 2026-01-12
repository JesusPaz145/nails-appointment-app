const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow any origin for this internal app deployment
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
    res.send('Nails by Anais API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
