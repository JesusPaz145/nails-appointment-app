-- Users Table
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    "user" VARCHAR(50) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    usr_lvl INT DEFAULT 2, -- 1=Admin, 2=User
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    icono VARCHAR(50) DEFAULT '💅'
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios_sistema(id),
    servicio_id INT REFERENCES servicios(id),
    fecha_cita DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cliente_nombre VARCHAR(100),
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmada, cancelada, completada
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Hours Table
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id SERIAL PRIMARY KEY,
    dia_semana INT NOT NULL, -- 0=Sun, 1=Mon...
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Seed Default Admin if not exists (Pass: admin123)
INSERT INTO usuarios_sistema (name, "user", pwd, email, phone, usr_lvl)
SELECT 'Administrador', 'admin', '$2b$10$X7.X.X.X.X.X.X.X.X.X.X.u.X.X.X.X.X.X.X.X.X.X.X', 'admin@example.com', '0000000000', 1
WHERE NOT EXISTS (SELECT 1 FROM usuarios_sistema WHERE "user" = 'admin');

-- Seed Default Hours
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 1, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 1);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 2, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 2);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 3, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 3);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 4, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 4);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 5, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 5);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 6, '18:00:00', '22:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 6);
INSERT INTO horarios_disponibles (dia_semana, hora_inicio, hora_fin, activo)
SELECT 0, '11:00:00', '18:00:00', true WHERE NOT EXISTS (SELECT 1 FROM horarios_disponibles WHERE dia_semana = 0);

-- Seed Basic Services
INSERT INTO servicios (nombre_servicio, descripcion, duracion_minutos, precio, icono)
SELECT 'Manicura Básica', 'Limpieza y esmaltado normal', 45, 15.00, '💅' WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre_servicio = 'Manicura Básica');
