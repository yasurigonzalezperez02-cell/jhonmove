const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function listUsers(req, res) {
  try {
    const users = await query(
      `SELECT id_usuario, nombre, correo, telefono, rol, estado, fecha_registro
       FROM usuarios ORDER BY fecha_registro DESC`
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

async function listDrivers(req, res) {
  try {
    const drivers = await query(
      `SELECT c.id_conductor, c.documento, c.licencia, c.disponibilidad,
              u.id_usuario, u.nombre, u.correo, u.telefono, u.estado
       FROM conductores c
       JOIN usuarios u ON u.id_usuario = c.id_usuario
       ORDER BY c.id_conductor DESC`
    );
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar conductores' });
  }
}

async function setUserStatus(req, res) {
  const id = Number(req.params.id);
  const { estado } = req.body;
  if (!['activo', 'inactivo'].includes(estado)) {
    return res.status(400).json({ error: 'estado debe ser activo o inactivo' });
  }
  try {
    await query(`UPDATE usuarios SET estado = ? WHERE id_usuario = ?`, [estado, id]);
    const rows = await query(
      `SELECT id_usuario, nombre, correo, rol, estado FROM usuarios WHERE id_usuario = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

async function seedAdmin(req, res) {
  const { nombre, correo, contraseña, secret } = req.body;
  if (secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ error: 'Secret inválido' });
  }
  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    const existing = await query(`SELECT id_usuario FROM usuarios WHERE rol = 'administrador' LIMIT 1`);
    if (existing.length) {
      return res.status(409).json({ error: 'Ya existe un administrador' });
    }
    const hash = await bcrypt.hash(contraseña, 10);
    const result = await query(
      `INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, 'administrador')`,
      [nombre, correo, hash]
    );
    res.status(201).json({ id_usuario: result.insertId, correo, rol: 'administrador' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Correo ya registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear admin' });
  }
}

module.exports = { listUsers, listDrivers, setUserStatus, seedAdmin };
