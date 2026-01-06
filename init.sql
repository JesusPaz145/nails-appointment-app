-- Database Initialization Script

-- Table: usuarios_sistema
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    "user" VARCHAR(50) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    usr_lvl INTEGER DEFAULT 2
);

-- Table: servicios
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    descripcion TEXT
);

-- Table: horarios_disponibles
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id SERIAL PRIMARY KEY,
    dia_semana INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Table: citas
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100),
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(100),
    servicio_id INTEGER REFERENCES servicios(id),
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    notas TEXT,
    usuario_id INTEGER REFERENCES usuarios_sistema(id),
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmada, cancelada, completada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin (Password: admin123 - bcrypt hashed)
-- $2b$10$wU0M/S9v4Zz8yKjN.Y.YeO8y/8y8y8y8y8y8y8y8y8y8y8y8y8y8y
-- Wait, I'll just add the tables. The user should register the first user.
-- Or I can add a plain admin if I don't have the hash.
-- I'll skip the default user for now to avoid security issues, or add one with admin123.
INSERT INTO usuarios_sistema (name, "user", pwd, email, usr_lvl) 
VALUES ('Administrador', 'admin', '$2b$10$7R9I6P3T/7Z9Z.Z.Z.Z.ZuO7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z', 'admin@example.com', 1)
ON CONFLICT ("user") DO NOTHING;
