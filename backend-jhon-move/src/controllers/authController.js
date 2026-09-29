const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id_usuario: user.id_usuario, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  const { nombre, correo, contraseña, telefono, rol, documento, licencia } = req.body;

  if (!nombre || !correo || !contraseña || !rol) {
    return res.status(400).json({ error: 'nombre, correo, contraseña y rol son obligatorios' });
  }
  if (!['pasajero', 'conductor'].includes(rol)) {
    return res.status(400).json({ error: 'rol debe ser pasajero o conductor' });
  }
  if (rol === 'conductor' && (!documento || !licencia)) {
    return res.status(400).json({ error: 'conductores requieren documento y licencia' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(contraseña, 10);
    const [result] = await conn.execute(
      `INSERT INTO usuarios (nombre, correo, contraseña, telefono, rol)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, hash, telefono || null, rol]
    );
    const id_usuario = result.insertId;

    if (rol === 'conductor') {
      await conn.execute(
        `INSERT INTO conductores (id_usuario, documento, licencia, disponibilidad)
         VALUES (?, ?, ?, FALSE)`,
        [id_usuario, documento, licencia]
      );
    }

    await conn.commit();
    const user = { id_usuario, nombre, correo, rol, telefono: telefono || null };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Correo o documento ya registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar' });
  } finally {
    conn.release();
  }
}

async function login(req, res) {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'correo y contraseña son obligatorios' });
  }

  try {
    const rows = await query(
      `SELECT id_usuario, nombre, correo, contraseña, telefono, rol, estado
       FROM usuarios WHERE correo = ?`,
      [correo]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    if (user.estado !== 'activo') {
      return res.status(403).json({ error: 'Cuenta inactiva' });
    }
    const ok = await bcrypt.compare(contraseña, user.contraseña);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol,
    };
    res.json({ token: signToken(payload), user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

async function me(req, res) {
  try {
    const rows = await query(
      `SELECT id_usuario, nombre, correo, telefono, rol, estado, fecha_registro
       FROM usuarios WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = rows[0];
    if (user.rol === 'conductor') {
      const driver = await query(
        `SELECT id_conductor, documento, licencia, disponibilidad
         FROM conductores WHERE id_usuario = ?`,
        [user.id_usuario]
      );
      user.conductor = driver[0] || null;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

async function updateProfile(req, res) {
  const { nombre, telefono } = req.body;
  try {
    await query(
      `UPDATE usuarios SET nombre = COALESCE(?, nombre), telefono = COALESCE(?, telefono)
       WHERE id_usuario = ?`,
      [nombre || null, telefono || null, req.user.id_usuario]
    );
    const rows = await query(
      `SELECT id_usuario, nombre, correo, telefono, rol FROM usuarios WHERE id_usuario = ?`,
      [req.user.id_usuario]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}

module.exports = { register, login, me, updateProfile };
