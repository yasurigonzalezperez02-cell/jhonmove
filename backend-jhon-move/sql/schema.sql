-- John Move schema (Clever Cloud MySQL)
-- Database already exists on Clever Cloud

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('pasajero', 'conductor', 'administrador') NOT NULL,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conductores (
  id_conductor INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  documento VARCHAR(30) NOT NULL UNIQUE,
  licencia VARCHAR(50) NOT NULL,
  disponibilidad BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  id_conductor INT NOT NULL,
  placa VARCHAR(10) NOT NULL UNIQUE,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  color VARCHAR(30),
  FOREIGN KEY (id_conductor) REFERENCES conductores(id_conductor)
);

CREATE TABLE IF NOT EXISTS viajes (
  id_viaje INT AUTO_INCREMENT PRIMARY KEY,
  id_pasajero INT NOT NULL,
  id_conductor INT,
  id_vehiculo INT,
  origen VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  estado ENUM('solicitado', 'aceptado', 'en_curso', 'finalizado', 'cancelado') DEFAULT 'solicitado',
  precio DECIMAL(10,2),
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_finalizacion DATETIME,
  FOREIGN KEY (id_pasajero) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_conductor) REFERENCES conductores(id_conductor),
  FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
);

CREATE TABLE IF NOT EXISTS calificaciones (
  id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_viaje INT NOT NULL UNIQUE,
  id_pasajero INT NOT NULL,
  id_conductor INT NOT NULL,
  puntuacion INT NOT NULL,
  comentario VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_viaje) REFERENCES viajes(id_viaje),
  FOREIGN KEY (id_pasajero) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_conductor) REFERENCES conductores(id_conductor)
);
